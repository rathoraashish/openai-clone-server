import mongoose from "mongoose";
import { to } from "../utils/helper.js";
import * as dotenv from "dotenv";
dotenv.config();

mongoose.set("debug", true);

let db_url = process.env.MongoURLLocal;

export async function getConnection() {
  try {
    let [err, connection] = await to(
      mongoose.connect(db_url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
    );
    if (err) {
      console.log("Error occurs db");
      throw err;
    }
    if (connection) {
      console.log("Connected to database successfully");
    }
    return Promise.resolve(connection);
  } catch (e) {
    throw e;
  }
}
