import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: String,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }]
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;