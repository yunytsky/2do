const editBtns = document.querySelectorAll(".category__edit");
const categoryInput = document.querySelector("#categoryName");
const newCategory = document.querySelector(".new-category__form");
const overlay = document.querySelector("#overlay")
const addCategoryBtn = document.getElementById('addCategoryBtn');
const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
const newCategoryPopup = document.getElementById('newCategoryPopup');
const deleteBtns = document.querySelectorAll(".category__delete");


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


editBtns.forEach((editBtn) => {
    editBtn.addEventListener("click", (event) => {
        const existingEditForm = document.querySelector(".category__edit-form");

        // If there is an existing edit form, restore its old name and remove the form
        if (existingEditForm) {
            const previousContainer = existingEditForm.parentElement;
            const previousOldName = existingEditForm.dataset.oldName;
            
            if (previousOldName) {
                const restoredName = document.createElement("p");
                restoredName.className = "task__name";
                restoredName.innerText = previousOldName;
                previousContainer.appendChild(restoredName);
            }
            existingEditForm.remove();
        }

        const categoryNameContainer = event.currentTarget.parentElement.previousElementSibling;
        
        // Get and remove the current category name
        const oldName = categoryNameContainer.lastElementChild;
        const oldNameText = oldName.innerText;
        oldName.remove();

        // Create a form
        const editForm = document.createElement("form");
        editForm.className = "category__edit-form";
        editForm.dataset.oldName = oldNameText; // Store the old name in a data attribute
        editForm.innerHTML = "<input type='submit' hidden> <input type='text' name='name' id='newName' placeholder='Write and press enter...'>";

        categoryNameContainer.appendChild(editForm);

        // Submitting the new name
        const id = event.currentTarget.parentElement.id;
        const newName = document.createElement("p");
        newName.className = "task__name";

        editForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const newNameValue = document.querySelector("#newName").value;
            const body = { name: newNameValue };

            fetch(`/my-categories/${id}/edit`, {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: { "content-type": "application/json" }
            })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Cannot edit the category");
                }
                editForm.remove();
                newName.innerText = newNameValue;
                categoryNameContainer.appendChild(newName);
            })
            .catch((err) => {
                displayErrorMessage();
                console.log(err);
            });
        });
    });
});

const empty = document.createElement("div");
const textNode = document.createTextNode("Create your first category by clicking a button below");
empty.appendChild(textNode);
empty.classList.add("tasks__empty");

deleteBtns.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", (event) => {
        const id = event.currentTarget.parentElement.id;
        const category = event.currentTarget.parentElement.parentElement;
        const categories = category.parentElement;

        fetch(`/my-categories/${id}/delete`, {
            method: "DELETE"
        }).then((res) => {
            if (!res.ok) {
                throw new Error("Cannot delete the task");
            }

            category.remove();

           if(categories.children.length === 0){
                categories.append(empty);
           }
            
        }).catch((err) => {
            displayErrorMessage();
            console.log(err);
        })
    });
});

addCategoryBtn.addEventListener('click', () => {
    newCategoryPopup.classList.remove('hidden');
    overlay.classList.remove('hidden');
});

cancelCategoryBtn.addEventListener('click', () => {
    newCategoryPopup.classList.add('hidden');
    overlay.classList.add('hidden');
    newCategory.reset();
});

overlay.addEventListener("click", () => {
    newCategoryPopup.classList.add('hidden');
    overlay.classList.add('hidden');
    newCategory.reset();
})


newCategory.addEventListener("submit", (event) => {
    event.preventDefault();

    fetch("/my-tasks/add/category/create", {
        method: "POST",
        body: categoryInput.value
    })
      .then((res) => {
          if (!res.ok) {
            if(res.status === 409){
                throw new Error("Category name is already taken")
            }else{
                throw new Error("Cannot create a category")
            }
          }

          newCategory.reset();
          window.location = "/my-categories"
      })
      .catch((err) => {
          displayErrorMessage(err.message);
        })
});