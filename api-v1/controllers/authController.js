import "dotenv/config";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

import {
    checkEmail,
    generateTokens,
    getAccessToken,
    updateAdmin,
} from "../services/authService.js";

export const login = asyncHandler(async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(401);
        throw new Error(errors.array()[0].msg);
    }

    const { email, password } = req.body;
    const admin = await checkEmail(email);

    if (!admin) {
        res.status(401);
        throw new Error("Invalid email");
    }

    // Wrong Password allowed 3 times per day
    if (admin.status === "freeze") {
        res.status(401);
        throw new Error("Your account is temporarily locked.");
    }

    const isEqualPassword = await bcrypt.compare(password, admin.password);
    if (!isEqualPassword) {
        const lastRequest = new Date(admin.updatedAt).toLocaleDateString();
        const isSameDate = lastRequest == new Date().toLocaleDateString();

        if (!isSameDate) {
            const adminData = {
                loginAttempt: 1,
            };
            await updateAdmin(admin.id, adminData);
        } else {
            let adminData;
            if (admin.loginAttempt >= 2) {
                adminData = {
                    status: "freeze",
                };
            } else {
                adminData = {
                    loginAttempt: {
                        increment: 1,
                    },
                };
            }
            await updateAdmin(admin.id, adminData);
        }

        res.status(401);
        throw new Error("Wrong Password!");
    }

    // Reset loginAttempt to 0 if login success
    if (admin.loginAttempt >= 1) {
        const adminData = {
            loginAttempt: 0,
        };
        await updateAdmin(admin.id, adminData);
    }

    const { accessToken, refreshToken } = await generateTokens(admin.id);

    // Assigning refresh token in http-only cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 100 * 60 * 1000, // 100 minutes
    });

    res.status(200).json({
        accessToken,
    });
});

export const handleTokenRefresh = asyncHandler(async (req, res) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401);
        throw new Error("Refresh Token not found");
    }

    const accessToken = await getAccessToken(refreshToken);

    res.status(200).json({
        accessToken,
    });
});
