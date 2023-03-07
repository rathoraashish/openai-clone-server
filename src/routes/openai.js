import express from "express";
const router = express.Router();
import { OpenAIController } from "../controllers/openAIController.js";

//import middleware
import { validateUser } from "../middlewares/userAuth.js";

/**
 * POST /davinci
 * Returns a response from OpenAI's text completion model.
 */
router.post("/davinci", validateUser, new OpenAIController().davinciHandler);

/**
 * POST /dalle
 * Returns a response from OpenAI's image generation model.
 */
router.post("/dalle", validateUser, new OpenAIController().dalleHandler);

/**
 * POST /whisper - BETA
 * Returns a response from OpenAI's speech to text generation.
 */
router.post("/whisper", validateUser, new OpenAIController().whisperHandler);

//Add routes for openai apis
export { router };
