import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    name: {type: String, required: true},
    done: {type: Boolean, required: true},
    imageUrl: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }
});

const Task = mongoose.model("Task", TaskSchema);

export default Task;