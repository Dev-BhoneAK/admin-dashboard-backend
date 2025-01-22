import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const generateApiKey = () => {
    return crypto.randomBytes(32).toString("hex");
};

export const createApp = async (data) => {
    const apiKey = generateApiKey();
    return prisma.app.create({
        data: {
            ...data,
            apiKey,
        },
    });
};

export const getApps = async (query = {}) => {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [apps, total] = await Promise.all([
        prisma.app.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
        }),
        prisma.app.count({ where }),
    ]);

    return {
        apps,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
    };
};

export const getAppById = async (id) => {
    return prisma.app.findUnique({
        where: { id },
        include: {
            _count: {
                select: { logs: true },
            },
        },
    });
};

export const getAppByApiKeyAndName = async (apiKey, name) => {
    return prisma.app.findFirst({
        where: {
            AND: [{ apiKey }, { name }],
        },
    });
};

export const findAppByApiKey = async (apiKey) => {
    return prisma.app.findFirst({
        where: {
            apiKey,
        },
    });
};

export const updateApp = async (id, data) => {
    return prisma.app.update({
        where: { id },
        data,
    });
};

export const deleteApp = async (id) => {
    // First check if app has any logs
    const app = await prisma.app.findUnique({
        where: { id },
        include: {
            _count: {
                select: { logs: true },
            },
        },
    });

    if (app._count.logs > 0) {
        throw new Error("Cannot delete app with existing logs");
    }

    return prisma.app.delete({
        where: { id },
    });
};
