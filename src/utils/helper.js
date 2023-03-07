import * as dotenv from "dotenv";
import bcrypt from "bcrypt";
import { CONSTANTS, CODES } from "../utils/siteConfig.js";
import { users } from "../database/models.js";
import jwt from "jsonwebtoken";
dotenv.config();
// to.js
export function to(promise) {
  return promise
    .then((data) => {
      return [null, data];
    })
    .catch((err) => {
      console.log(err, "Error resolving promise");
      return [err];
    });
}

//check if user already exists
export async function checkExistUser(username, email) {
  email = email.toLowerCase();
  let email_count = await users.countDocuments({ email });
  let username_count = await users.countDocuments({ username });

  return { email_count, username_count };
}

/** get default response */
export function getDefaultResponse() {
  return {
    message: CONSTANTS.SUCCESS,
    code: CODES.OK,
    data: null,
  };
}

//Generate hashed password
export const generatePassword = async (password) => {
  let hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

//Compare password via login
export const comparePassword = async (req_password, user_password, user_id) => {
  return bcrypt.compare(req_password, user_password).then(async (res) => {
    if (res) {
      return await generateToken(user_id);
    } else {
      return null;
    }
  });
};

//Generate JWT token for authentication
export const generateToken = async (user_id) => {
  let token = jwt.sign(
    {
      id: user_id,
    },
    process.env.EncryptionKEY,
    { expiresIn: "365 days" }
  );

  return token;
};
