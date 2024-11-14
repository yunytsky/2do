import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;