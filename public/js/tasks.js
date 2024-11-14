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
        const task = event.currentTarget.parentElement.parentElement.parentElement;
        const category = task.closest("ul");

        fetch(`/my-tasks/${id}/delete`, {
            method: "DELETE"
        }).then((res) => {
            if (!res.ok) {
                throw new Error("Cannot delete the task");
            }

            task.remove();
            
            // Check if there are still tasks in the category
            const tasksInCategory = category.querySelectorAll(".tasks__task");
            if (tasksInCategory.length === 0) {
                category.remove();
            }

            // Check if task list is empty
            const categories = document.querySelectorAll("#category");
            if(categories.length === 0) {
                taskList.prepend(empty);
            }
            
        }).catch((err) => {
            displayErrorMessage();
            console.log(err);
        })
    });
});

deleteAllBtn.addEventListener("click", (event) => {
    const categories = document.querySelectorAll("#category");

    if(categories.length > 0) {
        fetch("/my-tasks/delete-all", {
            method: "DELETE"
        }).then((res) => {
            if(!res.ok) {
                throw new Error("Cannot delete the tasks")
            }
            
            categories.forEach(category => {
                category.remove();
            })
            
            taskList.prepend(empty);
    
        }).catch((err) => {
            displayErrorMessage();
            console.log(err);
        })
    }
   
});

//EDIT
const editBtns = document.querySelectorAll(".task__edit");

editBtns.forEach((editBtn) => {
    editBtn.addEventListener("click", (event) => {
        const existingEditForm = document.querySelector(".task__edit-form");

        // If there is an existing edit form, restore its old name and remove the form
        if (existingEditForm) {
            const previousTaskContainer = existingEditForm.parentElement;
            const previousOldName = existingEditForm.dataset.oldName;

            if (previousOldName) {
                const restoredName = document.createElement("p");
                restoredName.className = "task__name";
                restoredName.innerText = previousOldName;
                previousTaskContainer.appendChild(restoredName);
            }
            existingEditForm.remove();
        }

        // Get the old task name
        const oldName = event.currentTarget.parentElement.previousElementSibling.lastElementChild;
        const oldNameText = oldName.innerText;
        oldName.remove();

        const taskNameContainer = event.currentTarget.parentElement.previousElementSibling;
        const checkbox = event.currentTarget.parentElement.previousElementSibling.firstElementChild.lastElementChild;

        // Create the edit form
        const editForm = document.createElement("form");
        editForm.className = "task__edit-form";
        editForm.dataset.oldName = oldNameText; // Store the old name in a data attribute
        editForm.innerHTML = "<input type='submit' hidden> <input type='text' name='name' id='newName' placeholder='Write and press enter...'>";

        taskNameContainer.appendChild(editForm);
        checkbox.style.pointerEvents = "none"; // Disable checkbox interactions while editing

        // Submitting the new name
        const id = event.currentTarget.parentElement.id;
        const newName = document.createElement("p");
        newName.className = "task__name";
        const line = document.createElement("span");
        line.className = "line";

        if (checkbox.classList.contains("checked")) {
            line.classList.add("checked");
        }

        editForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const newNameValue = document.querySelector("#newName").value;
            const body = { name: newNameValue };

            fetch(`/my-tasks/${id}/edit`, {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: { "content-type": "application/json" }
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Cannot edit the task");
                }
                editForm.remove();
                checkbox.style.pointerEvents = "auto"; // Re-enable checkbox interactions
                newName.innerText = newNameValue;
                newName.appendChild(line);
                taskNameContainer.appendChild(newName);
            })
            .catch((err) => {
                displayErrorMessage();
                console.log(err);
            });
        });
    });
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

