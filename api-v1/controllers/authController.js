import "dotenv/config";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

import { checkEmail } from "../services/authService.js";

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(401);
    throw new Error("Validation failed");
  }

  const { email, password } = req.body;
  const admin = await checkEmail(email);

  if (!admin) {
    res.status(401);
    throw new Error("Invalid email");
  }

  // Wrong Password allowed 3 times per day
  if (admin.status === "freeze") {
    res.status(401);
    throw new Error("Your account is temporarily locked.");
  }


});
