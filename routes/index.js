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
  changeTaskStatus,
  deleteTask,
  deleteAllTasks,
  editTask,
  createCategory,
  renderCategories,
  editCategory,
  deleteCategory
} from "../controllers/index.js"; 

const router = express.Router();


//GET
router.get("/", renderMain)

router.get("/signup", renderSignup)

router.get("/login", renderLogin)

router.get("/my-tasks", renderTasks)

router.get("/my-categories", renderCategories)


router.get("/my-tasks/add", renderAddTask)

router.get("/logout", logout)

//POST
router.post('/signup', signup)

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), login);

router.post("/my-tasks/add/category/create", createCategory)


//PATCH
router.patch("/my-tasks/:id", changeTaskStatus)

router.patch("/my-tasks/:id/edit", editTask)

router.patch("/my-categories/:id/edit", editCategory)


//DELETE
router.delete("/my-tasks/:id/delete", deleteTask)

router.delete("/my-tasks/delete-all", deleteAllTasks)

router.delete("/my-categories/:id/delete", deleteCategory)

export default router;