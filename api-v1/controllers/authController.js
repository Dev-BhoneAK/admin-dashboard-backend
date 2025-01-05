import "dotenv/config";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(401);
    throw new Error("Validation failed");
  }

  res.send("Login route");
});
