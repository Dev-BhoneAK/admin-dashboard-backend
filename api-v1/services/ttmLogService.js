import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getLogs = async (query = {}) => {
    const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        msisdn,
        status,
        provider,
        subscribeChannel,
        operationStatus,
        startDate,
        endDate,
        foc
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
    if (foc !== undefined) where.foc = foc === 'true';

    // Date range filter
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Validate sortBy field exists in schema
    const validSortFields = [
        'msisdn', 'status', 'provider', 'amount', 
        'operationStatus', 'subscribedAt', 'createdAt'
    ];
    const orderBy = {};
    if (validSortFields.includes(sortBy)) {
        orderBy[sortBy] = sortOrder.toLowerCase();
    } else {
        orderBy.createdAt = 'desc';
    }

    try {
        const [logs, total] = await Promise.all([
            prisma.thutamyay.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy
            }),
            prisma.thutamyay.count({ where })
        ]);

        return {
            logs,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching logs:', error);
        throw error;
    }
};

export const getLogById = async (id) => {
    return prisma.thutamyay.findUnique({
        where: { id }
    });
};

export const exportLogs = async (query = {}) => {
    const { 
        msisdn, status, provider, subscribeChannel, 
        operationStatus, startDate, endDate, foc 
    } = query;

    // Build where clause for filtering (same as getLogs)
    const where = {};
    if (msisdn) where.msisdn = { contains: msisdn };
    if (status) where.status = status;
    if (provider) where.provider = provider;
    if (subscribeChannel) where.subscribeChannel = subscribeChannel;
    if (operationStatus) where.operationStatus = operationStatus;
    if (foc !== undefined) where.foc = foc === 'true';
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get all filtered records for export
    return prisma.thutamyay.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
};

export const bulkUpdateStatus = async (ids, newStatus) => {
    return prisma.thutamyay.updateMany({
        where: {
            id: { in: ids }
        },
        data: {
            status: newStatus,
            updatedAt: new Date()
        }
    });
};

export const bulkDelete = async (ids) => {
    return prisma.thutamyay.updateMany({
        where: {
            id: { in: ids }
        },
        data: {
            deletedAt: new Date()
        }
    });
};

export const getStats = async (query = {}) => {
    const { startDate, endDate } = query;
    const where = {};
    
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalCount, providerStats, statusStats] = await Promise.all([
        prisma.thutamyay.count({ where }),
        prisma.thutamyay.groupBy({
            by: ['provider'],
            where,
            _count: true
        }),
        prisma.thutamyay.groupBy({
            by: ['status'],
            where,
            _count: true
        })
    ]);

    return {
        totalCount,
        byProvider: providerStats,
        byStatus: statusStats
    };
};
