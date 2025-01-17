import express from "express";
import { 
    fetchLogs, 
    fetchLogById, 
    downloadLogs,
    updateLogsStatus,
    softDeleteLogs,
    fetchStats
} from "../controllers/ttmLogController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected with verifyToken
router.use(verifyToken);

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

export default router;
