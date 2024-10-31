//ERROR MESSAGE
const body = document.querySelector("body")
let internalError = document.createElement("span");
internalError.className = "internal-error";
internalError.innerHTML = "Internal server error";
function displayErrorMessage(){
    body.append(internalError);
}

//DELETE
const taskList = document.querySelector(".tasks__list");
const tasksBtns = document.querySelector(".tasks__buttons");
const deleteBtns = document.querySelectorAll(".task__delete");
const deleteAllBtn = document.querySelector(".tasks__delete");

const empty = document.createElement("div");
const textNode = document.createTextNode("Add your first task by clicking a button below");
empty.appendChild(textNode);
empty.classList.add("tasks__empty");

deleteBtns.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", (event) => {
        const id = event.currentTarget.parentElement.id;
        const task = event.currentTarget.parentElement.parentElement;
        fetch(`/my-tasks/${id}/delete`, {
            method: "PATCH",
            body: id
        }).then((res) => {
            if (!res.ok) {
                throw new Error("Cannot delete the task")
            }
            task.remove();
            if(taskList.childElementCount == 0){
                taskList.appendChild(empty);
            }
        }).catch((err) => {
            displayErrorMessage();
            console.log(err);
        })
    })
});

deleteAllBtn.addEventListener("click", (event) => {
    const taskList = event.currentTarget.parentElement.previousElementSibling;
    fetch("/my-tasks/delete-all", {
        method: "PATCH"
    }).then((res) => {
        if(!res.ok) {
            throw new Error("Cannot delete the tasks")
        }
        let tasks = [];
        for (const task of taskList.children) {
            tasks.push(task);
        }
        tasks.forEach(task => {
            task.remove();
        })
        taskList.appendChild(empty);

    }).catch((err) => {
        displayErrorMessage();
        console.log(err);
    })
});

//EDIT
const editBtns = document.querySelectorAll(".task__edit");

editBtns.forEach((editBtn) => {
    editBtn.addEventListener("click", (event) => {
        //Creating a form
        const oldName = event.currentTarget.parentElement.previousElementSibling.lastElementChild;
        oldName.remove()
        
        const taskNameContainer = event.currentTarget.parentElement.previousElementSibling;
        const checkbox = event.currentTarget.parentElement.previousElementSibling.firstElementChild.lastElementChild;
        
        const editForm = document.createElement("form");
        editForm.className = "task__edit-form";
        editForm.innerHTML = "<input type='submit' hidden> <input type='text' name='name' id='newName' placeholder='Write and press enter...'>";

        taskNameContainer.appendChild(editForm);
        checkbox.style.pointerEvents = "none";

        //Submitting new name
        const id = event.currentTarget.parentElement.id;
        const newName = document.createElement("p")
        newName.className = "task__name";
        const line = document.createElement("span");
        line.className = "line";

        if (checkbox.classList.contains("checked")){
            line.classList.add("checked");
        }

        editForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const newNameValue = document.querySelector("#newName").value; 
            const body = {
                name: newNameValue
            };

            fetch(`/my-tasks/${id}/edit`, {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: {"content-type": "application/json"}
            }).then((res) => {
                if (!res.ok) {
                    throw new Error("Cannot edit the tasks")
                }
                editForm.remove();
                checkbox.style.pointerEvents = "auto";
                newName.innerText = newNameValue;
                newName.appendChild(line);
                taskNameContainer.appendChild(newName);
            }).catch((err) => {
                displayErrorMessage();
                console.log(err);
            })
        })
    })
});

//CHECKBOX
const checkboxes = document.querySelectorAll(".task__checkbox");

checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", (event) => {

        const id = event.currentTarget.parentElement.parentElement.id;
        const line = event.currentTarget.parentElement.nextElementSibling.firstElementChild;

        fetch(`/my-tasks/${id}`, {
            method: "PATCH",
            body: id
        }).then((res) => {
            if (!res.ok) {
                throw new Error("Cannot check the tasks")
            }
            checkbox.classList.toggle("checked");
            line.classList.toggle("checked");
        }).catch((err) => {
            displayErrorMessage();
            console.log(err);
        })

    })
});