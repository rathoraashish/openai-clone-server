import { Configuration, OpenAIApi } from "openai";
import { getDefaultResponse } from "../utils/helper.js";
import { CODES, CONSTANTS } from "../utils/siteConfig.js";
import { Prompt } from "../database/schemas/prompts.js";
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
    // Validate request body
    if (!req.body.prompt) {
      return res.status(400).send({
        error: 'Missing required field "prompt" in request body',
      });
    }

    try {
      // Filter prompt string
      const prompt = req.body.prompt;
      const cleanPrompt = filter.isProfane(prompt)
        ? filter.clean(prompt)
        : prompt;
      console.log(cleanPrompt);

      promptWithHistory.push(cleanPrompt);

      const response = await generateText(
        cleanPrompt,
        openai,
        promptWithHistory
      );

      promptWithHistory.push(response.data.choices[0].text);

      console.log("Prompt history", promptWithHistory);

      console.log("Result is", response.data.choices[0].text);
      // Return response from OpenAI API
      res.status(200).send({
        bot: response.data.choices[0].text,
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
