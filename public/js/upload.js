




   const form = document.getElementById("uploadForm");
   const  msg= document.getElementById("message");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // ✅ Declare before using
        const formData = new FormData(form);
        // console.log(formData)

        try {
          const res = await fetch("/upload", {
            method: "POST",
            body: formData
          });

          const data = await res.json();
          if(res.status === 401){
            window.location.href = "/loginpage"
          }
   
          if(data.message){ msg.textContent = data.message;
            msg.style.color= "blue"

        }
        if(data.error){
          msg.textContent= data.error;
          msg.style.color= "red";
        }
        
        
          } catch (err) {
          console.error(err);
        }
      });


     
