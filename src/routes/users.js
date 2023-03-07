import express from "express";
const router = express.Router();
import { UserController } from "../controllers/userController.js";
import { validateUser } from "../middlewares/userAuth.js";

// Add new user route
router.post("/add", new UserController().addUser);

// User login route
router.post("/login", new UserController().login);

// Add new prompt for user
router.post("/add-prompt", validateUser, new UserController().addNewPrompt);

// Get all prompts
router.get("/prompts", validateUser, new UserController().getAllUserPrompts);

//Get prompt by prompt id
router.get("/prompt", validateUser, new UserController().getPromptById);

export { router };
