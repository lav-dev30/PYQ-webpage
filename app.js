require('dotenv').config(); // Load environment variables
const express = require("express")
const app = express()
const cloudinary = require('./config/cloudinary')
const { connectDB } = require('./config/mongodb');
const path = require("path")
const multer = require("multer")
const mongoose = require('mongoose')
const fs = require('fs')
const cors = require('cors')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Papers = require('./model/paper')
const admin = require('./model/admin');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set(path.join(__dirname, 'uploads'));
app.use(express.static(path.join(__dirname, 'public')));


// connect to mongodb
connectDB();




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
  }
})


const upload = multer({ storage: storage })


function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    return res.status(401).json({ redirect: "/loginpage" });
  }
  else {
    try {
      let data = jwt.verify(req.cookies.token, `${process.env.KEY}`);
      req.user = data;
      next();
    }
    catch (error) {
      return res.status(401).json({ redirect: "/loginpage" });
    }
  }
}

function isLoggedIn2(req, res, next) {
  if (!req.cookies.token) res.redirect("/loginpage");
  else {
    let data = jwt.verify(req.cookies.token, `${process.env.KEY}`);
    req.user = data;
    next();
  }
}




app.get('/', function (req, res, err) {
  res.render('index');
})

app.post('/upload', isLoggedIn, upload.single('file'), async function (req, res, next) {

  try {
    let { branch, year, semester, subject } = req.body;
    const file_path = `/uploads/${req.file.filename}`;
    const filepath = req.file.path;
    console.log(filepath);

    branch = branch.toUpperCase();
    subject = subject.toUpperCase();


    // check if the paper is already exists

    const existingPaper = await Papers.findOne({ branch, year, subject, semester });


    if (existingPaper) {

      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      return res.status(400).json({ error: "Paper already exists" });
    }


    // req.file.path is the FULL path to the temp file
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Exam_papers",
      use_filename: true,
      unique_filename: false,
      resource_type: "raw"
    });

    const papers = new Papers({
      branch, year, semester, subject, file_path: result.secure_url, publicId: result.public_id
    });
    await papers.save();

    res.json({ message: 'file uploaded', papers });

    // IMPORTANT: Delete the file from /uploads after Cloudinary is done
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up even if upload fails
    return res.status(500).json({ error: error.message });
  }
});





app.post('/exam', async function (req, res, err) {


  try {
    const { branch, year, semester, subject, page = 1, limit = 10 } = req.body;



    let filter = {};
    if (year) filter.year = year;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    if (subject) filter.subject = subject;

    //PAGINATION CALCULATION
    const skip = (page - 1) * limit;



    const papers = await Papers.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    // count total documents
    const total = await Papers.countDocuments(filter);



    res.json({
      papers,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }



})

app.get('/home', function (req, res, err) {
  res.render('index')
})

app.get('/browse', async function (req, res, err) {
  const currentYears = await Papers.find({});
  const yearArray = currentYears.map(y => y.year);
  const uniqueYear = [... new Set(yearArray)];

  res.render('browse', { years: uniqueYear });
})

app.get('/contact', function (req, res, err) {
  res.render('contact');
})

app.get('/aboutUs', function (req, res, err) {
  res.render('aboutUs');
})




app.get('/subjects', async (req, res) => {
  const { branch, semester, year } = req.query;

  const query = {};
  if (branch) query.branch = branch;
  if (semester) query.semester = semester;
  if (year) query.year = year;

  const subjects = await Papers.find(query);
  res.json(subjects.map(s => s.subject));
});


app.get('/uploadPage', isLoggedIn2, function (req, res, err) {
  res.render('upload')
})



app.get("/loginpage", function (req, res) {
  res.render('login')
})


app.post("/login", async function (req, res) {
  
  const { email, password } = req.body;

  try {
    let user = await admin.findOne({ email: email })
    if (!user) {
      return res.json({ msg: "User Not Found" })
    }
    await bcrypt.compare(password, user.password, function (err, result) {
      if (result) {

        let token = jwt.sign({ email: email }, `${process.env.KEY}`)
        res.cookie("token", token)
        return res.json({
          success: true,
          redirect: "/uploadPage"
        })
      }
      else { res.json({ msg: "Password Is Wrong" }) }
    })

  } catch (error) {
    return res.status(403).json({ error: "Somthing Went Wrong" });

  }


})

app.get("/createAdmin", function (req, res) {
  res.render("create");
})

app.post("/createAdmin", function (req, res, err) {
  const { username, email, password } = req.body;

  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {

      try {
        let createdUser = await admin({
          username,
          email,
          password: hash
        })
        await createdUser.save();
        res.send("done");

      } catch (error) {
        res.status(403).json({ error: "user did not create" });

      }

    })
  })



})

app.get('/logout', function (req, res) {
  res.cookie('token', "");
  res.redirect('/loginpage');
})

app.get('/delete', function (req, res) {
  res.render('delete')
})

app.post('/deletePapers', async function (req, res) {
  const yearValue = req.body.year


  const papers = await Papers.find({ year: yearValue });


  if (papers.length === 0) return res.send("No papers found for that exam year.");

  // 2. Extract public_ids (assumes you store them in 'cloudinary_id')
  // console.log(papers)

  function chunkArray(arr, size) {
    let chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  const publicIds = papers.map(paper => paper.publicId);
  const batches = chunkArray(publicIds, 50);

  for (batche of batches) {

    try {
      // 3. Delete from Cloudinary in batches (max 100 per call)
      // Specify resource_type: 'raw' for PDFs/Docs
      const response = await cloudinary.api.delete_resources(batche, {
        resource_type: 'raw',
        invalidate: true
      });
      // console.log(response)

      // 2. Identify which specific IDs Cloudinary actually deleted
      // The 'deleted' object looks like: { "id1": "deleted", "id2": "not_found" }
      const successfullyDeletedIds = Object.keys(response.deleted).filter(
        id => response.deleted[id] === 'deleted'
      );

      // 4. Delete the schema records from MongoDB
      // 3. ONLY delete confirmed IDs from MongoDB
      if (successfullyDeletedIds.length > 0) {
        await Papers.deleteMany({
          publicId: { $in: successfullyDeletedIds }
        });
        res.send(`Cleaned up ${successfullyDeletedIds.length} records from DB.`);
      }

      // 4. Handle failures (Partial or not_found)
      if (response.partial || successfullyDeletedIds.length < batche.length) {
        res.send("Some files were not deleted. Keeping those records in DB for retry.");
      }



    } catch (error) {
      console.error("Batch deletion failed:", error);
      throw error;
    }
  }

})

app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
})