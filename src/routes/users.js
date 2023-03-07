import express from "express";
const router = express.Router();
import { UserController } from "../controllers/userController.js";
import { validateUser } from "../middlewares/userAuth.js";

/**
 * POST /add
 * Add new user route
 */
router.post("/add", new UserController().addUser);

/**
 * POST /login
 * User login route
 */
router.post("/login", new UserController().login);

/**
 * POST /add-prompt
 * Add new prompt for user
 */
router.post("/add-prompt", validateUser, new UserController().addNewPrompt);

/**
 * GET /prompts
 * Get all prompts
 */
router.get("/prompts", validateUser, new UserController().getAllUserPrompts);

/**
 * GET /prompt
 * Get prompt by prompt id
 */
router.get("/prompt", validateUser, new UserController().getPromptById);

export { router };
