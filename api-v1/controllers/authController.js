import "dotenv/config";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

import { checkEmail, generateTokens, refreshTokens } from "../services/authService.js";

export const login = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(401);
        throw new Error("Validation failed");
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
            result = await updateAdmin(admin?.id, adminData);
        } else {
            if (admin.error >= 2) {
                const adminData = {
                    status: "freeze",
                };
            } else {
                const adminData = {
                    error: {
                        increment: 1,
                    },
                };
            }
            result = await updateAdmin(admin.id, adminData);
        }

        res.status(401);
        throw new Error("Wrong Password!");
    }

    // Reset loginAttempt to 0 if login success
    if (admin.loginAttempt >= 1) {
        const adminData = {
            loginAttempt: 0,
        };
        result = await updateAdmin(admin?.id, adminData);
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

export const refreshTokens = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401);
        throw new Error("Refresh Token not found");
    }

    const accessToken = await refreshTokens(refreshToken);

    res.status(200).json({
        accessToken,
    });
}
