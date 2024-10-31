import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    name: {type: String, required: true},
    done: {type: Boolean, required: true},
    imageUrl: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }
});

const Task = mongoose.model("Task", TaskSchema);

export default Task;