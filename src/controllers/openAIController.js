import { Configuration, OpenAIApi } from "openai";
import { getDefaultResponse } from "../utils/helper.js";
import { CODES, CONSTANTS } from "../utils/siteConfig.js";
import { getConnection } from "../database/index.js";
import { users } from "../database/models.js";
import mongoose from "mongoose";
import { generateText } from "../apis/davinci.js";
import { generateImage } from "../apis/dalle.js";
import { generateVoiceToText } from "../apis/whisper.js";
import Filter from "bad-words";
import * as dotenv from "dotenv";

// Load environment variables from .env file
try {
  dotenv.config();
} catch (error) {
  console.error("Error loading environment variables:", error);
  process.exit(1);
}

const filter = new Filter();

// Create OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create OpenAI API client
const openai = new OpenAIApi(configuration);

const promptWithHistory = [];

export class OpenAIController {
  constructor() {
    dotenv.config();
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Object}
   */
  async davinciHandler(req, res) {
    let finalResponse = getDefaultResponse();
    const userId = req.user.id;
    let connection;
    connection = await getConnection();
    // Validate request body
    if (!req.body.prompt || !req.body.prompt_id) {
      finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
      finalResponse.code = CODES.BAD_REQUEST;
      return res.status(400).json(finalResponse);
    }

    // Filter prompt string
    const prompt = req.body.prompt;
    const promptId = req.body.prompt_id;

    const cleanPrompt = filter.isProfane(prompt)
      ? filter.clean(prompt)
      : prompt;
    console.log("Clean prompt", cleanPrompt);

    // Find the prompt by ID and update prompt history
    users
      .findOne(
        { _id: userId, "prompts._id": promptId },
        { "prompts.history": 1 }
      )
      .then(async (user) => {
        // Get the first (and only) element of the prompts array
        const promptHistory = user.prompts[0];

        // Get the history array for the prompt
        const historyArray = promptHistory.history;

        // Add the prompt with history to the array
        historyArray.push(cleanPrompt);

        // Generate response from OpenAI API
        await generateText(cleanPrompt, openai, historyArray)
          .then(async (response) => {
            // Push the response text to the history array for the prompt
            historyArray.push(response.data?.choices[0].text);
            // Update the history array for the prompt in the database
            await users.updateOne(
              { _id: userId, "prompts._id": promptId },
              { $set: { "prompts.$.history": historyArray } }
            );

            // Return response from OpenAI API
            res.status(200).send({
              bot: response.data.choices[0].text,
            });
          })
          .catch((err) => {
            return res.status(400).send({ message: "Unable to get response" });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(404).json({ message: "Error fetching prompt" });
      });
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Object}
   */
  async dalleHandler(req, res) {
    console.log("User is", req?.user);
    // Validate request body
    if (!req.body.prompt) {
      return res.status(400).send({
        error: 'Missing required field "prompt" in request body',
      });
    }

    // Filter prompt string
    const prompt = req.body.prompt;
    const cleanPrompt = filter.isProfane(prompt)
      ? filter.clean(prompt)
      : prompt;

    try {
      const response = await generateImage(cleanPrompt, openai);

      console.log(response.data.data[0].url);
      res.status(200).send({
        bot: response.data.data[0].url,
      });
    } catch (error) {
      // Log error and return a generic error message
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Object}
   */
  async whisperHandler(req, res) {
    try {
      const response = await generateVoiceToText(openai);
      console.log(response.data.data[0]);
      res.status(200).send({
        bot: response.data.data[0],
      });
    } catch (error) {
      // Log error and return a generic error message
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
      });
    }
  }
}
