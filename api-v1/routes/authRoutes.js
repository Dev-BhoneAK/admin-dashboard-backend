import express from "express";

import { loginValidator } from "../middleware/validators.js";
import { login } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginValidator, login);

export default router;
