const newTask = document.querySelector(".new-task__form")
const taskCategory = document.querySelector("#taskCategory")
const taskInput = document.querySelector("#taskName");
const image = document.querySelector("#taskImage");


//ERROR MESSAGE
const body = document.querySelector("body");

function createError(message) {
    const error = document.createElement("span");
    error.className = "error-message"; 
    error.innerHTML = message; 
    return error;
}

function displayErrorMessage(message) {
    const error = createError(message || "Internal server error");
    body.append(error);
}


newTask.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData();

    formData.append("name", taskInput.value);
    formData.append("category", taskCategory.value);
    formData.append("image", image.files[0]);  
   
    fetch("/my-tasks/add", {
        method: "POST",
        body: formData,
    })
      .then((res) => {
          if (!res.ok) {
              throw new Error("Cannot add a tasks")
          }
          window.location = "/"
      })
      .catch((err) => {
          displayErrorMessage();
          console.log("Cannot add a task")
        })
});

