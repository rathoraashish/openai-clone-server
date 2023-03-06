import mongoose from "mongoose";
// Define the prompt schema
const promptSchema = new mongoose.Schema(
  {
    title: { type: String },
    history: { type: [String] },
  },
  { timestamps: true }
);

// Define the Prompt model
const Prompt = mongoose.model("Prompt", promptSchema);

export { Prompt, promptSchema };
