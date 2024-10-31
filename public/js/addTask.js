const newTask = document.querySelector(".new-task__form")
const textarea = document.querySelector("#newTaskName");

//ERROR MESSAGE
const body = document.querySelector("body");
let internalError = document.createElement("span");
internalError.className = "internal-error";
internalError.innerHTML = "Internal server error";
function displayErrorMessage() {
    body.append(internalError);
}


newTask.addEventListener("submit", (event) => {
    event.preventDefault();
    fetch("/my-tasks/add", {
        method: "PATCH",
        body: textarea.value
    })
      .then((res) => {
          if (!res.ok) {
              throw new Error("Cannot add the tasks")
          }
          window.location = "/"
      })
      .catch((err) => {
          displayErrorMessage();
          console.log("Cannot add a task")
        })
})