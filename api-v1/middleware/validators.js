import { body } from "express-validator";

import {
    statuses,
    providers,
    subscribeChannels,
    operationStatuses,
} from "../config/index.js";

export const loginValidator = [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists(),
    body("password", "Password must be 8 digits.")
        .trim()
        .notEmpty()
        .isLength({ min: 8 })
        .escape(),
];

export const logCreateValidator = [
    body("msisdn").notEmpty().withMessage("MSISDN is required"),

    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(statuses)
        .withMessage("Invalid status"),

    body("provider")
        .notEmpty()
        .withMessage("Provider is required")
        .isIn(providers)
        .withMessage("Invalid provider"),

    body("operationId")
        .notEmpty()
        .withMessage("Operation ID is required")
        .isString()
        .withMessage("Operation ID must be string"),

    body("subscribeChannel")
        .if(body("status").equals("subscribe"))
        .notEmpty()
        .withMessage("Subscribe channel is required")
        .isIn(subscribeChannels)
        .withMessage("Invalid subscribe channel"),

    body("operationStatus")
        .notEmpty()
        .withMessage("Operation status is required")
        .isIn(operationStatuses)
        .withMessage("Invalid operation status"),

    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isInt({ min: 0 })
        .withMessage("Amount must be a positive number"),

    body("foc").optional().isBoolean().withMessage("FOC must be boolean"),

    body("subscribedAt")
        .if(body("status").equals("subscribe"))
        .isISO8601()
        .withMessage("Invalid subscribed date format"),

    body("unsubscribeAt")
        .if(body("status").equals("unsubscribe"))
        .isISO8601()
        .withMessage("Invalid unsubscribe date format"),

    body("paidAt")
        .if(body("status").equals("renew"))
        .isISO8601()
        .withMessage("Invalid paid date format"),

    body("expiredAt")
        .if(body("status").equals("renew"))
        .isISO8601()
        .withMessage("Invalid expired date format"),

    body("unsubscribeChannel")
        .if(body("status").equals("unsubscribe"))
        .notEmpty()
        .withMessage("Unsubscribe channel is required"),
];
