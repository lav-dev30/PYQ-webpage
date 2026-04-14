




const form = document.getElementById("uploadForm");
const msg = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ✅ Declare before using
  const formData = new FormData(form);
  // console.log(formData)

  button.innerHTML = "";
  button.innerHTML = `<div id="loader">
  <div id= "paragraph">
  <p>Uploading... Please wait</p>
  </div>
    <div class="spinner"></div>
</div>
</div>
`
  const loader = document.getElementById('loader');
  loader.style.setProperty('display', 'flex', 'important');


  try {
    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    console.log(data)
    if (res.status === 401) {
      window.location.href = "/loginpage"
    }

    if (data.message) {
      document.getElementById('loader').style.display = 'none';
      button.innerHTML = "Upload";
      msg.textContent = data.message;
      msg.style.color = "blue"

      // Refresh after 5 seconds
      setTimeout(() => {
        location.reload();
      }, 4000);

    }
    if (data.error) {
      document.getElementById('loader').style.display = 'none';
      button.innerHTML = "Upload";

      msg.textContent = data.error;
      msg.style.color = "red";
    }


  } catch (err) {
    console.error(err);
  }
});



