import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, unique: true},
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }]
});

const User = mongoose.model("User", UserSchema);

export default User;