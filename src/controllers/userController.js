import { getConnection } from "../database/index.js";
import { users } from "../database/models.js";
import * as dotenv from "dotenv";
import { Prompt } from "../database/schemas/prompts.js";
import {
  getDefaultResponse,
  checkExistUser,
  generatePassword,
  comparePassword,
} from "../utils/helper.js";
import { CODES, CONSTANTS } from "../utils/siteConfig.js";
import mongoose from "mongoose";

export class UserController {
  constructor() {
    dotenv.config();
  }

  /**
   *add new user
   */
  async addUser(req, res, next) {
    let finalResponse = getDefaultResponse();
    req = req.body;
    console.log("Request is", req);
    let connection;
    try {
      //check validation
      connection = await getConnection();
      if (!req.username || !req.email || !req.password) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = CODES.BAD_REQUEST;
        return res.status(400).send(finalResponse);
      }

      //check if user is exist
      let is_exist = await checkExistUser(req.username, req.email);
      if (!is_exist.email_count && !is_exist.username_count) {
        try {
          req.password = await generatePassword(req.password);
          req.email = req.email.toLowerCase();
          // req.status = 1;
          let data = await users.create(req);

          finalResponse.message = CONSTANTS.REGISTER_SUCCESS;
          finalResponse.data = { user_id: data._id };
          return res.status(200).send(finalResponse);
        } catch (error) {
          console.log("error>>", error);
          finalResponse.code = CODES.BAD_REQUEST;
          finalResponse.message = "Error occurred";
          return res.status(400).send(finalResponse);
        }
      } else {
        finalResponse.code = CODES.BAD_REQUEST;

        if (is_exist.email_count) {
          finalResponse.message = CONSTANTS.EMAIL_ALREADY_EXISTS;
        } else {
          finalResponse.message = CONSTANTS.USERNAME_ALREADY_EXISTS;
        }
        return res.status(400).send(finalResponse);
      }
    } catch (e) {
      return res.status(400).send(e);
    } finally {
      mongoose.connection.close();
    }
  }

  /**
   * login user
   */
  async login(req, res, next) {
    let finalResponse = getDefaultResponse();
    req = req.body;
    let connection;
    try {
      connection = await getConnection();

      //check validation
      const { user_input, password } = req;
      if (!user_input || !password) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = CODES.BAD_REQUEST;
        return res.status(400).send(finalResponse);
      }

      let user = await users.findOne({
        $or: [{ email: user_input.toLowerCase() }, { username: user_input }],
      });

      if (user) {
        let jwt_token = await comparePassword(
          req.password,
          user.password,
          user._id
        );

        user = user.toJSON(); //turns it into JSON YAY!
        delete user.password;
        user.token = jwt_token;
        finalResponse.message = CONSTANTS.LOGIN;
        finalResponse.data = user;
        return res.status(200).send(finalResponse);
      } else {
        finalResponse.code = CODES.BAD_REQUEST;
        finalResponse.message = CONSTANTS.INCORRECT_EMAIL_PASSWORD;
        return res.status(400).send(finalResponse);
      }
    } catch (e) {
      console.log("Error in  login", e);
      return res.status(400).send(e);
    } finally {
      mongoose.connection.close();
    }
  }

  /**
   * Adding new prompts for user
   */
  async addNewPrompt(req, res, next) {
    let finalResponse = getDefaultResponse();
    const userId = req.user.id;
    console.log("User id is", userId);
    const promptData = req.body;
    let connection;
    try {
      connection = await getConnection();
      if (!promptData.title) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = CODES.BAD_REQUEST;
        return res.status(400).send(finalResponse);
      }
      // Find the user by ID
      users
        .findById(userId)
        .then((user) => {
          // Create a new prompt and add it to the user's prompts array
          const prompt = new Prompt(promptData);
          user.prompts.push(prompt);
          // Save the updated user with the new prompt
          return user.save();
        })
        .then((savedUser) => {
          console.log("Saved user response", savedUser);
          return res.status(200).send({ message: "Prompt Added" });
        })
        .catch((err) => {
          console.error(err);
          return res.status(404).send({ message: "Error saving prompt" });
        });
    } catch (e) {
      console.log("Error in adding new prompt", e);
      return res.status(400).send(e);
    } finally {
      //   mongoose.connection.close();
    }
  }

  /**
   * Get all prompts of user
   */
  async getAllUserPrompts(req, res, next) {
    let finalResponse = getDefaultResponse();
    const userId = req.user.id;
    console.log("User id is", userId);
    let connection;
    try {
      connection = await getConnection();
      // Find the user by ID
      users
        .findById(userId)
        .then((user) => {
          // Create a new prompt and add it to the user's prompts array
          console.log("User data is", user);
          //   let prompts = user.prompts;
          finalResponse.data = user.prompts;
          return res.status(200).send(finalResponse);
        })
        .catch((err) => {
          console.error(err);
          return res.status(404).send({ message: "Error fetching prompts" });
        });
    } catch (e) {
      console.log("Error fetching prompts", e);
      return res.status(400).send(e);
    } finally {
      //   mongoose.connection.close();
    }
  }

  /**
   * Get user prompt by id
   */
  async getPromptById(req, res, next) {
    let finalResponse = getDefaultResponse();
    const userId = req.user.id;
    const promptId = req.query.id;
    console.log("User id is", userId);
    console.log("Prompt id is", promptId);
    let connection;
    try {
      connection = await getConnection();
      if (!userId || !promptId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = CODES.BAD_REQUEST;
        return res.status(400).send(finalResponse);
      }
      // Find the user by ID
      users
        .findOne({ _id: userId, "prompts._id": promptId }, { "prompts.$": 1 })
        .then((user) => {
          const prompt = user.prompts[0]; // Get the first (and only) element of the prompts array
          finalResponse.data = prompt;
          res.status(200).json(finalResponse);
        })
        .catch((err) => {
          console.error(err);
          res.status(404).json({ message: "Error fetching prompt" });
        });
    } catch (e) {
      console.log("Error fetching prompts", e);
      return res.status(400).send(e);
    } finally {
      //   mongoose.connection.close();
    }
  }
}
