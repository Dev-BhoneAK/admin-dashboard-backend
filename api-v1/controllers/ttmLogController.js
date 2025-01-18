import asyncHandler from "express-async-handler";
import {
    getLogs,
    getLogById,
    getLogsForExport,
    updateLogsStatus,
    softDeleteLogs,
    getStats,
    createLog,
} from "../services/ttmLogService.js";
import { Parser } from "json2csv";

export const fetchLogs = asyncHandler(async (req, res) => {
    const result = await getLogs(req.query, req.appName);
    res.json(result);
});

export const fetchLogById = asyncHandler(async (req, res) => {
    const log = await getLogById(req.params.id, req.appName);
    if (!log) {
        res.status(404);
        throw new Error("Log not found");
    }
    res.json(log);
});

export const downloadLogs = asyncHandler(async (req, res) => {
    const logs = await getLogsForExport(req.query, req.appName);
    
    const fields = [
        "msisdn",
        "status",
        "provider",
        "operationId",
        "subscribeChannel",
        "amount",
        "operationStatus",
        "foc",
        "subscribedAt",
        "unsubscribeAt",
        "paidAt",
        "expiredAt",
        "createdAt",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(logs);

    res.header("Content-Type", "text/csv");
    res.attachment(`logs-${new Date().toISOString()}.csv`);
    res.send(csv);
});

export const updateLogsStatusBulk = asyncHandler(async (req, res) => {
    const { ids, newStatus } = req.body;
    const result = await updateLogsStatus(ids, newStatus, req.appName);
    res.json(result);
});

export const softDeleteLogsBulk = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    const result = await softDeleteLogs(ids, req.appName);
    res.json(result);
});

export const fetchStats = asyncHandler(async (req, res) => {
    const stats = await getStats(req.query, req.appName);
    res.json(stats);
});

export const insertLog = asyncHandler(async (req, res) => {
    const log = await createLog(req.body, req.appName);
    res.status(201).json(log);
});
