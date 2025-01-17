import asyncHandler from "express-async-handler";
import { getLogs, getLogById, exportLogs, bulkUpdateStatus, bulkDelete, getStats } from "../services/ttmLogService.js";
import { Parser } from 'json2csv';

export const fetchLogs = asyncHandler(async (req, res) => {
    const result = await getLogs(req.query);
    res.json(result);
});

export const fetchLogById = asyncHandler(async (req, res) => {
    const log = await getLogById(req.params.id);
    if (!log) {
        res.status(404);
        throw new Error("Log not found");
    }
    res.json(log);
});

export const downloadLogs = asyncHandler(async (req, res) => {
    const logs = await exportLogs(req.query);
    
    const fields = [
        'msisdn',
        'status',
        'provider',
        'operationId',
        'subscribeChannel',
        'amount',
        'operationStatus',
        'foc',
        'subscribedAt',
        'unsubscribeAt',
        'unsubscribeChannel',
        'paidAt',
        'expiredAt',
        'createdAt'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(logs);

    res.header('Content-Type', 'text/csv');
    res.attachment(`thutamyay_logs_${new Date().toISOString()}.csv`);
    res.send(csv);
});

export const updateLogsStatus = asyncHandler(async (req, res) => {
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error("Please provide valid log IDs");
    }

    if (!status) {
        res.status(400);
        throw new Error("Please provide a status");
    }

    const result = await bulkUpdateStatus(ids, status);
    res.json(result);
});

export const softDeleteLogs = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error("Please provide valid log IDs");
    }

    const result = await bulkDelete(ids);
    res.json(result);
});

export const fetchStats = asyncHandler(async (req, res) => {
    const stats = await getStats(req.query);
    res.json(stats);
});
