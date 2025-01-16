import asyncHandler from "express-async-handler";
import { getLogs, getLogById } from "../services/ttmLogService.js";

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
