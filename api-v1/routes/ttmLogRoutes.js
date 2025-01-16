import express from "express";
import { fetchLogs, fetchLogById } from "../controllers/ttmLogController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, fetchLogs);
router.get("/:id", verifyToken, fetchLogById);

export default router;
