import { body } from "express-validator";

export const loginValidator = [
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").exists(),
  body("password", "Password must be 8 digits.")
    .trim()
    .notEmpty()
    .isLength({ min: 8 })
    .escape(),
];
