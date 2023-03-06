import { getConnection } from "../database/index.js";
import { users } from "../database/models.js";
import * as dotenv from "dotenv";
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
}
