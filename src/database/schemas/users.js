import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, default: "" },
        username: { type: String },
        password: String
    },
    { timestamps: true }
);

const users = mongoose.model("users", UserSchema);

export { users };
