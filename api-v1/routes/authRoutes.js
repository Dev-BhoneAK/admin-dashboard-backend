import express from "express";

import { loginValidator } from "../middleware/validators.js";
import { login, handleTokenRefresh } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginValidator, login);

router.post("/refresh-token", handleTokenRefresh);

export default router;
