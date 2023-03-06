import { getDefaultResponse } from "../utils/helper.js";
import { CODES, CONSTANTS } from "../utils/siteConfig.js";
import { Prompt } from "../database/schemas/prompts.js";
import { getConnection } from "../database/index.js";
import { users } from "../database/models.js";
import mongoose from "mongoose";

export class OpenAIController {
  constructor() {
    dotenv.config();
  }

  // Add functions for handling openai apis data
}
