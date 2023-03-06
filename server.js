import express from 'express'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'
import * as dotenv from 'dotenv'
import Filter from 'bad-words'

//import routes
import { router as userRoute } from "./src/routes/users.js";

//import middleware
import { validateUser } from './src/middlewares/userAuth.js'

import { genrateText } from './src/apis/davinci.js';
import { genrateImage } from './src/apis/dalle.js'
import { genrateVoiceToText } from './src/apis/whisper.js'

const filter = new Filter()

// Load environment variables from .env file
try {
  dotenv.config()
} catch (error) {
  console.error('Error loading environment variables:', error)
  process.exit(1)
}

// Create OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

// Create OpenAI API client
const openai = new OpenAIApi(configuration)

// Create Express app
const app = express()

const promtWithHistory = [];


// Parse JSON in request body
app.use(express.json())

// Enable CORS
app.use(cors())

// Add new user route
app.use('/user', userRoute)

/**
 * GET /
 * Returns a simple message.
 */
app.get('/', (req, res) => {
  res.status(200).send({
    message: 'Hello World!',
  })
})

/**
 * POST /davinci
 * Returns a response from OpenAI's text completion model.
 */
app.post('/davinci', validateUser, async (req, res) => {
  // Validate request body
  if (!req.body.prompt) {
    return res.status(400).send({
      error: 'Missing required field "prompt" in request body',
    })
  }

  try {
    // Filter prompt string
    const prompt = req.body.prompt
    const cleanPrompt = filter.isProfane(prompt) ? filter.clean(prompt) : prompt;
    console.log(cleanPrompt)

    promtWithHistory.push(cleanPrompt);

    const response = await genrateText(cleanPrompt, openai, promtWithHistory);

    promtWithHistory.push(response.data.choices[0].text);

    console.log("Prompt history", promtWithHistory);

    console.log("Result is", response.data.choices[0].text)
    // Return response from OpenAI API
    res.status(200).send({
      bot: response.data.choices[0].text,
    })
  } catch (error) {
    // Log error and return a generic error message
    console.error(error)
    res.status(500).send({
      error: 'Something went wrong',
    })
  }
})

/**
 * POST /dalle
 * Returns a response from OpenAI's image generation model.
 */
app.post('/dalle', validateUser, async (req, res) => {
  console.log("User is", req?.user)
  // Validate request body
  if (!req.body.prompt) {
    return res.status(400).send({
      error: 'Missing required field "prompt" in request body',
    })
  }

  // Filter prompt string
  const prompt = req.body.prompt
  const cleanPrompt = filter.isProfane(prompt) ? filter.clean(prompt) : prompt;

  try {
    const response = await genrateImage(cleanPrompt, openai);

    console.log(response.data.data[0].url)
    res.status(200).send({
      bot: response.data.data[0].url,
    })
  } catch (error) {
    // Log error and return a generic error message
    console.error(error)
    res.status(500).send({
      error: 'Something went wrong',
    })
  }
})

/**
 * POST /whisper - BETA
 * Returns a response from OpenAI's speech to text generation.
 */
app.post('/whisper', async (req, res) => {
  try {
    const response = await genrateVoiceToText(openai);

    console.log(response.data.data[0])
    res.status(200).send({
      bot: response.data.data[0],
    })
  } catch (error) {
    // Log error and return a generic error message
    console.error(error)
    res.status(500).send({
      error: 'Something went wrong',
    })
  }
})


// Start server
const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Server listening on port ${port}`))
