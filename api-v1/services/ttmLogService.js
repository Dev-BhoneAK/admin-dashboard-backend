import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getModelByAppName = (appName) => {
    const models = {
        thutamyay: prisma.thutamyay,
        tayplus: prisma.tayplus,
    };
    return models[appName.toLowerCase()];
};

// const formatDateFields = (data) => {
//     const dateFields = ["subscribedAt", "unsubscribeAt", "paidAt", "expiredAt"];
//     const formattedData = { ...data };

//     dateFields.forEach((field) => {
//         if (formattedData[field]) {
//             try {
//                 // Ensure proper ISO format with timezone
//                 formattedData[field] = new Date(
//                     formattedData[field]
//                 ).toISOString();
//             } catch (error) {
//                 console.error(
//                     `Invalid date for ${field}:`,
//                     formattedData[field]
//                 );
//                 formattedData[field] = null;
//             }
//         }
//     });

//     return formattedData;
// };

export const getLogs = async (query = {}, appName) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        msisdn,
        status,
        provider,
        subscribeChannel,
        operationStatus,
        startDate,
        endDate,
        foc,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where = {};

    // Text filters
    if (msisdn) where.msisdn = { contains: msisdn };
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (subscribeChannel) where.subscribeChannel = subscribeChannel;
    if (operationStatus) where.operationStatus = operationStatus;

    // Boolean filter
    if (foc !== undefined) where.foc = foc === "true";

    // Date range filter
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Validate sortBy field exists in schema
    const validSortFields = [
        "msisdn",
        "status",
        "provider",
        "amount",
        "operationStatus",
        "subscribedAt",
        "createdAt",
    ];
    const orderBy = {};
    if (validSortFields.includes(sortBy)) {
        orderBy[sortBy] = sortOrder;
    } else {
        orderBy.createdAt = "desc";
    }

    try {
        const model = getModelByAppName(appName);
        const [logs, total] = await Promise.all([
            model.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy,
            }),
            model.count({ where }),
        ]);

        return {
            logs,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error("Error fetching logs:", error);
        throw error;
    }
};

export const getLogById = async (id, appName) => {
    const model = getModelByAppName(appName);
    return model.findUnique({
        where: { id },
    });
};

export const getLogsForExport = async (query = {}, appName) => {
    const {
        msisdn,
        status,
        provider,
        subscribeChannel,
        operationStatus,
        startDate,
        endDate,
        foc,
    } = query;

    // Build where clause for filtering (same as getLogs)
    const where = {};
    if (msisdn) where.msisdn = { contains: msisdn };
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (subscribeChannel) where.subscribeChannel = subscribeChannel;
    if (operationStatus) where.operationStatus = operationStatus;
    if (foc !== undefined) where.foc = foc === "true";
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const model = getModelByAppName(appName);
    return model.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
};

export const updateLogsStatus = async (ids, newStatus, appName) => {
    const model = getModelByAppName(appName);
    return model.updateMany({
        where: {
            id: { in: ids },
        },
        data: {
            status: newStatus,
            updatedAt: new Date(),
        },
    });
};

export const softDeleteLogs = async (ids, appName) => {
    const model = getModelByAppName(appName);
    return model.updateMany({
        where: {
            id: { in: ids },
        },
        data: {
            deletedAt: new Date(),
        },
    });
};

export const getStats = async (query = {}, appName) => {
    const { startDate, endDate } = query;
    const where = {};

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const model = getModelByAppName(appName);
    const [totalCount, providerStats, statusStats] = await Promise.all([
        model.count({ where }),
        model.groupBy({
            by: ["provider"],
            where,
            _count: true,
        }),
        model.groupBy({
            by: ["status"],
            where,
            _count: true,
        }),
    ]);

    return {
        total: totalCount,
        byProvider: providerStats,
        byStatus: statusStats,
    };
};

const checkRecentLog = async (model, { msisdn, status, provider }) => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentLog = await model.findFirst({
        where: {
            msisdn,
            status,
            provider,
            createdAt: {
                gte: oneHourAgo,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return recentLog;
};

export const createLog = async (logData, appName) => {
    const model = getModelByAppName(appName);
    if (!model) {
        throw new Error("Invalid app name");
    }

    // Check for recent log
    const recentLog = await checkRecentLog(model, {
        msisdn: logData.msisdn,
        status: logData.status,
        provider: logData.provider,
    });

    if (recentLog) {
        throw new Error("Similar log exists");
    }

    const data = {
        ...logData,
        foc: logData.foc || false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        return await model.create({ data });
    } catch (error) {
        if (error.code === "P2002") {
            throw new Error("Duplicate operation ID");
        }
        console.error("Error creating log:", error);
        throw error;
    }
};
