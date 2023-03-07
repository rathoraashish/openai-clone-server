import express from "express";
import cors from "cors";

//import routes
import { router as userRoute } from "./src/routes/users.js";

//import middleware
import { validateUser } from "./src/middlewares/userAuth.js";

//import controller functions
import { OpenAIController } from "./src/controllers/openAIController.js";

// Create Express app
const app = express();

// Parse JSON in request body
app.use(express.json());

// Enable CORS
app.use(cors());

// Add new user route
app.use("/user", userRoute);

/**
 * GET /
 * Returns a simple message.
 */
app.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello World!",
  });
});

/**
 * POST /davinci
 * Returns a response from OpenAI's text completion model.
 */
app.post("/davinci", validateUser, new OpenAIController().davinciHandler);

/**
 * POST /dalle
 * Returns a response from OpenAI's image generation model.
 */
app.post("/dalle", validateUser, new OpenAIController().dalleHandler);

/**
 * POST /whisper - BETA
 * Returns a response from OpenAI's speech to text generation.
 */
app.post("/whisper", validateUser, new OpenAIController().whisperHandler);

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on port ${port}`));
