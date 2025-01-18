import express from "express";
import { 
    fetchLogs, 
    fetchLogById, 
    downloadLogs,
    updateLogsStatus,
    softDeleteLogs,
    fetchStats,
    insertLog
} from "../controllers/ttmLogController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyApiKey } from "../middleware/apiKeyAuth.js";
import { logCreateValidator } from "../middleware/validators.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

// Protected routes that require admin token
router.use(["/", "/single/:id", "/export", "/stats", "/bulk-status", "/bulk-delete"], verifyToken);

// Get logs with filtering and pagination
router.get("/", fetchLogs);

// Get single log
router.get("/single/:id", fetchLogById);

// Export logs to CSV
router.get("/export", downloadLogs);

// Get statistics
router.get("/stats", fetchStats);

// Bulk operations
router.put("/bulk-status", updateLogsStatus);
router.delete("/bulk-delete", softDeleteLogs);

// Insert new log with API key validation
router.post("/create", verifyApiKey, logCreateValidator, validateRequest, insertLog);

export default router;
