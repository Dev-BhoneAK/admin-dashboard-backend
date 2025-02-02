import "dotenv/config";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import logger from "morgan";

import rateLimiter from "./middleware/rateLimiter.js";
import authRouter from "./routes/authRoutes.js";
import ttmRouter from "./routes/ttmLogRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(helmet());
app.use(rateLimiter);
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies
app.use(compression());
if (process.env.NODE_ENV === "production") {
    app.use(logger("combined")); // Detailed logs with more info (IP, user-agent, etc.)
} else {
    app.use(logger("dev")); // Concise logs for development
}

// Routes
app.use("/auth", authRouter);
app.use("/thutamyay", ttmRouter);

// error handler
app.use(notFound);
app.use(errorHandler);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
