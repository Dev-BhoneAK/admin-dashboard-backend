import express from "express";
import { login } from "../controllers/authController.js";
import { loginValidator } from "../middleware/validators.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.post("/login", loginValidator, validateRequest, login);
// router.post("/refresh", refreshToken);

export default router;
