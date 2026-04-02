// section for changing the subjects dynamically based on branch and semster from model

try {
  
  const branchSel = document.getElementById('branch');
  const semSel = document.getElementById('semester');
  const subjSel = document.getElementById('subject');
  const yearSel = document.getElementById('year');
  
  
  async function fillSubjects() {
    const branch = branchSel.value;
    const sem = semSel.value;
    const y_ear = yearSel.value;
    subjSel.innerHTML = '<option value="" selected disabled >Loading...</option>';
  
    if (!branch && !sem && !y_ear) return;
  
    let query = new URLSearchParams();
    if (branch) query.append("branch", branch);
    if (sem) query.append("semester", sem);
    if (y_ear) query.append("year", y_ear);
    // console.log(y_ear)
    query = query.toString()
    // console.log(query)
    
  
    const res = await fetch(`/subjects?${query}`);
    const subjects = await res.json();
    // console.log(subjects)
  
    subjSel.innerHTML = '<option value="">Selected-None</option>';
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      subjSel.appendChild(opt);
    });
  }
  branchSel.addEventListener('change', fillSubjects);
  semSel.addEventListener('change', fillSubjects);
  yearSel.addEventListener('change', fillSubjects)
  
} catch (error) {
  
}



// filter section

try {
  let currentPage = 1;
  
  
  document.getElementById('button').addEventListener('click', async (e) => {
    e.preventDefault();
  
    const button = document.getElementById('button')
  
  button.innerHTML= "";
  button.innerHTML =  `<div id="loader">
   <div class="spinner"></div>
  </div>
  </div>
  `
   const loader = document.getElementById('loader');
  loader.style.setProperty('display', 'flex', 'important');
  
    const paperList = document.getElementById('results-section');
  
  
    const form = document.getElementById('searchForm');
    const formData = new FormData(form);
  
  
  
  
    // console.log("formdata is ", formData);
  
    const data = Object.fromEntries(formData.entries());
    // console.log(data);
  
  
    // Send as JSON to backend\
  
      const res = await fetch('/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          page: currentPage,
          limit: 10
        })
      });
      
   
    const response = await res.json();
    // console.log(response);
    const papers = response.papers;
    renderPagination(response.totalPages);
  
    document.getElementById('loader').style.display = 'none';
    button.innerHTML = "Filter";
  
    paperList.innerHTML = "";
    papers.forEach(paper => {
      const div = document.createElement("div");
      div.setAttribute("id", "paper-item");
      div.innerHTML = ` 
                <div class= "paper-card">
                  <div class="paper-title">${paper.subject}</div>
                  <div class="paper-info">
                      <span>${paper.branch} – ${paper.year}</span>
                      <span>Sem ${paper.semester}</span>
                      <span class="badge">OCBC</span>
                      <span class= "pdf"> <a href= "${paper.file_path}" target="_blank">View Here</a> </span>
                  </div>
                  </div>
              `
      paperList.appendChild(div);
      // console.log(paper.file_path)
    });
  });
  


// pagination section 


function renderPagination(totalPages) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === currentPage) {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      currentPage = i;
      document.getElementById("button").click();
    };

    container.appendChild(btn);
  }
}

} catch (error) {
  console.log(error);
    document.getElementById('loader').style.display = 'none';
  button.innerHTML = "Filter";
}


