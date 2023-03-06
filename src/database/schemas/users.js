import mongoose from "mongoose";
import { promptSchema } from "./prompts.js";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, default: "" },
    username: { type: String },
    password: String,
    prompts: [promptSchema],
  },
  { timestamps: true }
);

const users = mongoose.model("users", UserSchema);

export { users };
