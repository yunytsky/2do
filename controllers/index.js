import {generatePassword} from "../lib/passwordUtil.js"
import User from "../models/User.js";
import Task from "../models/Task.js";
import Category from "../models/Category.js";

// GET
export const renderMain = (req, res) => {
    if(req.isAuthenticated()){
        res.redirect(302, `/my-tasks`)
    } else {
        res.render("index.ejs");
    }
};

export const renderSignup = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(302, `/my-tasks`);
    } else {
        res.render("signup.ejs", { messages: req.flash("error") });
    }
};

export const renderLogin = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(302, `/my-tasks`);
    } else {
        const messages = [req.flash("error"), req.flash("message")];
        res.render("login.ejs", { messages });
    }
};

// Fetch and display tasks by user ID, populating the category for each task
export const renderTasks = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const tasks = await Task.find({ user: req.user.id }).populate("category");
            res.render("tasks.ejs", { username: req.user.username, id: req.user.id, tasks });
        } catch (err) {
            console.error(err);
            res.redirect(303, "/login");
        }
    } else {
        res.redirect(303, "/login");
    }
};

export const renderAddTask = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const categories = await Category.find(); 
            res.render("add.ejs", { username: req.user.username, id: req.user.id, categories });
        } catch (err) {
            console.error(err);
            res.redirect(303, "/login");
        }
    } else {
        res.redirect(303, "/login");
    }
};

export const logout = async (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logOut((err) => {
            if (err) return next(err);
            res.redirect(303, "/");
        });
    } else {
        res.redirect(303, "/");
    }
};

// POST
export const signup = async (req, res, next) => {
    const username = await User.findOne({ username: req.body.username }).exec();
    if (username) {
        req.flash("error", "The username is already taken");
        res.redirect(303, "/signup");
    } else if (req.body.password !== req.body.password_2) {
        req.flash("error", "Passwords do not match");
        res.redirect(303, "/signup");
    } else {
        try {
            const password = await generatePassword(req.body.password);
            const user = new User({ username: req.body.username, password });
            await user.save();
            req.flash("message", "Account created");
            res.redirect(303, "/login");
        } catch (err) {
            next(err);
        }
    }
};

export const login = (req, res) => {
    res.redirect(303, `/my-tasks/`);
};

// PATCH

// Add a new task associated with the user and category
export const addTask = async (req, res, next) => {
    try {
        //category
        const task = new Task({ name: req.body, done: false, user: req.user.id });
        await task.save();

        // Update the user's tasks list
        await User.findByIdAndUpdate(req.user.id, { $push: { tasks: task._id } });
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// Change the task status (done/undone)
export const changeTaskStatus = async (req, res, next) => {
    try {
        console.log(req.params.id)
        const task = await Task.findById(req.params.id);
        task.done = !task.done;
        await task.save();
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// Delete a task by task ID
export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Task.findByIdAndDelete(id);
        await User.findByIdAndUpdate(req.user.id, { $pull: { tasks: id } });
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// Delete all tasks for the user
export const deleteAllTasks = async (req, res, next) => {
    try {
        await Task.deleteMany({ user: req.user.id });
        await User.findByIdAndUpdate(req.user.id, { $set: { tasks: [] } });
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};

// Edit a task's name or category
export const editTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        //add category
        await Task.findByIdAndUpdate(id, { name: req.body.name });
        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
};
