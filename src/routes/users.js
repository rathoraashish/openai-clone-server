import express from "express";
const router = express.Router();
import { UserController } from "../controllers/userController.js";

router.post("/add", new UserController().addUser);

router.post("/login", new UserController().login);

export { router };