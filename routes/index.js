import express from "express";
import passport from "passport";
import {
  renderMain,
  renderSignup,
  renderLogin,
  renderTasks,
  renderAddTask,
  logout,
  signup,
  login,
  addTask,
  changeTaskStatus,
  deleteTask,
  deleteAllTasks,
  editTask,
} from "../controllers/index.js"; 
import User from "../models/User.js";
const router = express.Router();


//GET
router.get("/", renderMain)

router.get("/signup", renderSignup)

router.get("/login", renderLogin)

router.get("/my-tasks", renderTasks)

router.get("/my-tasks/add", renderAddTask)

router.get("/logout", logout)

//POST
router.post('/signup', signup)

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), login);


//PATCH
router.patch("/my-tasks/add", addTask)

router.patch("/my-tasks/:id", changeTaskStatus)

router.patch("/my-tasks/:id/delete", deleteTask)

router.patch("/my-tasks/delete-all", deleteAllTasks)

router.patch("/my-tasks/:id/edit", editTask)

export default router;