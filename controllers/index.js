import {generatePassword} from "../lib/passwordUtil.js"
import User from "../models/User.js";
import Task from "../models/Task.js";
import Category from "../models/Category.js";
import fs from "fs";
import path from "path";

// GET
export const renderMain = (req, res) => {
    if(req.isAuthenticated()){
        return res.redirect(302, `/my-tasks`)
    } else {
        return res.render("index.ejs");
    }
};

export const renderSignup = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect(302, `/my-tasks`);
    } else {
        return res.render("signup.ejs", { messages: req.flash("error") });
    }
};

export const renderLogin = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(302, `/my-tasks`);
    } else {
        const messages = [req.flash("error"), req.flash("message")];
        return res.render("login.ejs", { messages });
    }
};

export const renderTasks = async (req, res) => {
    if (req.isAuthenticated()) {
        try {            
            const tasks = await Task.find({ user: req.user.id }).populate("category");
            const categories = []
            const categorizedTasks = [];
            const uncategorizedGroup = { category: "Uncategorized", tasks: [] };

            tasks.forEach(task => {
                if (task.category) {
                    // If the task has a category, check if the category is already in the list
                    let categoryGroup = categorizedTasks.find(group => group.category === task.category.name);
                    
                    // If the category group doesn't exist, create it
                    if (!categoryGroup) {
                        categoryGroup = { category: task.category.name, tasks: [] };
                        categorizedTasks.push(categoryGroup);
                    }

                    // Add the task to the respective category group
                    categoryGroup.tasks.push(task);
                } else {
                    // If the task doesn't have a category, add it to the "Not categorized" group
                    uncategorizedGroup.tasks.push(task);
                }
            });

            // If there are uncategorized tasks, push them into the categorizedTasks array
            if (uncategorizedGroup.tasks.length > 0) {
                categorizedTasks.push(uncategorizedGroup);
            }
            
            res.render("tasks.ejs", { username: req.user.username, id: req.user.id, categorizedTasks });
        } catch (err) {
            console.error(err);
            return res.redirect(303, "/login");
        }
    } else {
        return res.redirect(303, "/login");
    }
};

export const renderCategories = async (req, res) => {
    if (req.isAuthenticated()) {
        try {            
            const categories = await Category.find({ user: req.user.id });
            
            res.render("categories.ejs", { username: req.user.username, id: req.user.id, categories });
        } catch (err) {
            console.error(err);
            return res.redirect(303, "/login");
        }
    } else {
        return res.redirect(303, "/login");
    }
};

export const renderAddTask = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const categories = await Category.find({user: req.user.id}); 
            return res.render("add.ejs", { username: req.user.username, id: req.user.id, categories });
        } catch (err) {
            console.error(err);
            return res.redirect(303, "/login");
        }
    } else {
        return res.redirect(303, "/login");
    }
};

export const logout = async (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logOut((err) => {
            if (err) return next(err);
            return res.redirect(303, "/");
        });
    } else {
        return res.redirect(303, "/");
    }
};

// POST
export const signup = async (req, res, next) => {
    const username = await User.findOne({ username: req.body.username }).exec();
    if (username) {
        req.flash("error", "The username is already taken");
        return res.redirect(303, "/signup");
    } else if (req.body.password !== req.body.password_2) {
        req.flash("error", "Passwords do not match");
        return res.redirect(303, "/signup");
    } else {
        try {
            const password = await generatePassword(req.body.password);
            const user = new User({ username: req.body.username, password });
            await user.save();
            req.flash("message", "Account created");
            return res.redirect(303, "/login");
        } catch (err) {
            next(err);
        }
    }
};

export const login = (req, res) => {
    return res.redirect(303, `/my-tasks/`);
};

export const addTask = async (req, res, next) => {
    try {
        console.log(req.body)
        console.log(req.file)
        let categoryId = null;
        let imageUrl = null;

        if(req.body.category){
            const category = await Category.findOne({user: req.user.id, name: req.body.category});
            categoryId = category._id
        }


        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;  // Store the image URL (relative path)
        }

        const task = new Task({ name: req.body.name, done: false, user: req.user.id, category: categoryId, imageUrl: imageUrl });
        await task.save();

        // Update the user's tasks list
        await User.findByIdAndUpdate(req.user.id, { $push: { tasks: task._id } });
        if(categoryId){
            await Category.findByIdAndUpdate(categoryId, { $push: { tasks: task._id } });
        }

        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const category = await Category.findOne({ name: req.body, user: req.user.id }).exec();
        if(category){
            return res.sendStatus(409);
        }

        const newCategory = new Category({ name: req.body, user: req.user.id });
        await newCategory.save();

        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
}

// PATCH

// Change the task status (done/undone)
export const changeTaskStatus = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        task.done = !task.done;
        await task.save();
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

export const editTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Task.findByIdAndUpdate(id, { name: req.body.name });
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

export const editCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndUpdate(id, { name: req.body.name });
        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};


//DELETE
// Delete a task by task ID
export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).send("Task not found");
        }

        if (task.category) {
            await Category.findByIdAndUpdate(task.category, {
                $pull: { tasks: id }
            });
        }

        if(task.imageUrl){
            const imagePath = path.join("public", task.imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                }
            })
        }

        await User.findByIdAndUpdate(req.user.id, { $pull: { tasks: id } });
        await Task.findByIdAndDelete(id);

        return res.sendStatus(200);

    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).send("Category not found");
        }

        
        if (category.tasks.length > 0) {
            const tasks = await Task.find({category: category._id});
            for (const task of tasks) {
    
                if(task.imageUrl){
                    const imagePath = path.join("public", task.imageUrl);

                    fs.unlink(imagePath, (err) => {
                        if (err) {
                            console.error("Error deleting image:", err);
                        }
                    })
                }

                await Task.findByIdAndDelete(task._id);
        
            }
        }

        await User.findByIdAndUpdate(req.user.id, { $pull: { category: id } });
        await Category.findByIdAndDelete(id);

        return res.sendStatus(200);

    } catch (err) {
        next(err);
    }
};



// Delete all tasks for the user
export const deleteAllTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.user.id });

        for (const task of tasks) {
            if (task.category) {
                await Category.findByIdAndUpdate(task.category, {
                    $pull: { tasks: task._id }
                });
            }

            if(task.imageUrl){
                const imagePath = path.join("public", task.imageUrl);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error("Error deleting image:", err);
                    }
                })
            }
    
        }

        await User.findByIdAndUpdate(req.user.id, { $set: { tasks: [] } });
        await Task.deleteMany({ user: req.user.id });

        return res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};
