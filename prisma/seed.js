import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const generateApiKey = () => {
    return crypto.randomBytes(32).toString("hex");
};

async function main() {
    // Find and delete existing apps one by one
    const existingApps = await prisma.app.findMany({
        where: {
            name: {
                in: ["thutamyay", "tayplus"],
            },
        },
    });

    for (const app of existingApps) {
        await prisma.app.delete({
            where: { id: app.id },
        });
        console.log(`Deleted existing app: ${app.name}`);
    }

    const appsData = [
        {
            name: "thutamyay",
            apiKey: generateApiKey(),
            description: "Thutamyay Payment Logs",
        },
        {
            name: "tayplus",
            apiKey: generateApiKey(),
            description: "Tayplus Payment Logs",
        },
    ];

    for (const data of appsData) {
        const createdApp = await prisma.app.create({
            data,
        });
        console.log(`Created app: ${createdApp.name}`);
        console.log(`API Key: ${createdApp.apiKey}`);
        console.log("---");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
