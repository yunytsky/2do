const express = require("express");
const router = express.Router();
const passport = require("passport");
const { generatePassword } = require("../lib/passwordUtil");
const User = require("../models/User");
const flash = require("connect-flash");
const req = require("express/lib/request");

//GET
router.get("/", (req, res) => {
    if(req.isAuthenticated()){
        res.redirect(302, `/my-tasks/${req.user.id}`)
    }else{
        res.render("index.ejs")
    }
})

router.get("/signup", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(302, `/my-tasks/${req.user.id}`);
    } else {
        res.render("signup.ejs", { messages: req.flash("error")});
    }
})

router.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(302, `/my-tasks/${req.user.id}`);
    } else {
        const messages = [req.flash("error"), req.flash("message")];
        res.render("login.ejs", {messages});
    }
})

router.get("/my-tasks/:id", (req, res) => {
    if(req.isAuthenticated()) {
        const username = req.user.username;
        const tasks = req.user.tasks;
        res.render("tasks.ejs", { username: username, id: req.user.id, tasks: tasks });
    }else{     
        res.redirect(303, "/login");
    }
})

router.get("/my-tasks/:id/add", async (req, res) => {
    if (req.isAuthenticated()) {
        res.render("add.ejs", { username: req.user.username, id: req.user.id });
    } else {
        res.redirect(303, "/login");
    }
})

router.get("/logout", (req, res, next) => {
    if(req.isAuthenticated) {
        req.logOut((err) => {
            if (err) {
                return next(err);
            }
            res.redirect(303, "/");
        });
    }else{
        res.redirect(303, "/")
    }
})

//POST
router.post('/signup', async (req, res, next) => {
    const username = await User.findOne({ username: req.body.username }).exec();
    if (username != null) {
        req.flash("error", "The username is already taken");
        res.redirect(303, `/signup`);
    }else{
        if (req.body.password != req.body.password_2) {
            req.flash("error", "Passwords do not match");
            res.redirect(303, `/signup`);
        } else {
            try {
                const password = await generatePassword(req.body.password);
                const user = await new User({
                    username: req.body.username,
                    password: password,
                    tasks: []
                })
                await user.save()
                req.flash("message", "Account is created");
                res.redirect(303, "/login");
            } catch (err) {
                return next(err);
            }
        }
    }
})

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), (req, res) => {
    res.redirect(303, `/my-tasks/${req.user.id}`);
});


//PATCH
router.patch("/my-tasks/:id/add", async (req, res, next) => {
    try{
        let user = await User.findById(req.user.id);
        user.tasks.push({ name: req.body, done: false });
        await user.save();
        res.sendStatus(200);
    }catch(err){
        return next(err);
    }
})

router.patch("/my-tasks/:id", async (req, res, next) => {
    try {
        let user = await User.findById(req.user.id);
        if(user.tasks[req.body].done == false){
            user.tasks[req.body] = { name: user.tasks[req.body].name, done: true };
        }else{
            user.tasks[req.body] = { name: user.tasks[req.body].name, done: false };
        }
        await user.save();
        res.sendStatus(200);
    } catch (err) {
        return next(err);
    }

})

router.patch("/my-tasks/:id/delete", async (req, res, next) => {
    try{
        let user = await User.findById(req.user.id);
        user.tasks.splice(req.body, 1)
        await user.save();
        res.sendStatus(200);
    }catch(err){
        return next(err);
    }

})

router.patch("/my-tasks/:id/delete-all", async(req, res, next) =>{
    try {
        let user = await User.findById(req.user.id);
        user.tasks = []
        await user.save();
        res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
})

router.patch("/my-tasks/:id/edit", async (req, res, next) => {
    try{
        let user = await User.findById(req.user.id);
        user.tasks[req.body.id] = {name: req.body.name, done: user.tasks[req.body.id].done};
        await user.save();
        res.sendStatus(200);
    }catch(err){
        return next();
    }
})

module.exports = router;