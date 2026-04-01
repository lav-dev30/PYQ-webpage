const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema({
    branch:{ type: String, required: true},
    year: { type: Number, required: true},
    semester: { type: Number, required: true},
    subject: { type: String, required: true},
    file_path: { type: String, required: true},
    publicId:{ type: String, required: true}
});

const Papers = mongoose.model("papers", paperSchema);
module.exports= Papers;