import express from "express";
import cors from "cors";

//import routes
import { router as userRoute } from "./src/routes/users.js";
import { router as promptRoute } from "./src/routes/openai.js";

// Create Express app
const app = express();

// Parse JSON in request body
app.use(express.json());

// Enable CORS
app.use(cors());

// Add new user route
app.use("/user", userRoute);

// Prompt route for openAI apis(davinci, dalle)
app.use("/prompt", promptRoute);

/**
 * GET /
 * Returns a simple message.
 */
app.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello World!",
  });
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server listening on port ${port}`));
