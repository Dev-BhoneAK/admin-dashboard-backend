import "dotenv/config";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkEmail = async (email) => {
    return prisma.admin.findUnique({
        where: { email: email },
    });
};

export const generateTokens = async (adminId) => {
    //creating a access token
    const accessToken = jwt.sign(
        {
            adminId,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "1m",
        }
    );

    // Creating refresh token
    const refreshToken = jwt.sign(
        {
            adminId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "2m" }
    );
    return { accessToken, refreshToken };
};

export const getAccessToken = async (refreshToken) => {
    try {
        const admin = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const adminId = admin.adminId;

        const accessToken = jwt.sign(
            { adminId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1m" }
        );

        return { accessToken };
    } catch (err) {
        console.error(err);
        throw new Error("JWT Verification Failed");
    }
};

export const updateAdmin = async (id, adminData) => {
    return prisma.admin.update({
        where: { id: id },
        data: adminData,
    });
};
