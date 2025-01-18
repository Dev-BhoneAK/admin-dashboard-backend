import asyncHandler from "express-async-handler";
import { getAppByApiKeyAndName } from "../services/appService.js";

export const verifyApiKey = asyncHandler(async (req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    const appName = req.headers["x-app-name"];

    if (!apiKey || !appName) {
        res.status(401);
        throw new Error("API key and app name are required");
    }

    const app = await getAppByApiKeyAndName(apiKey, appName);
    if (!app) {
        res.status(401);
        throw new Error("Invalid API key or app name");
    }

    // Store just the app name in request for use in controller
    req.appName = appName.toLowerCase();
    next();
});
