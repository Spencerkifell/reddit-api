import express from "express";
import UserRepository from "../repositories/UserRepository";
import AuthException from "../exceptions/AuthException";
import HttpException from '../exceptions/HttpException';
import { user } from "@prisma/client";
import { generateError, errorCodes, comparePassword } from "../globals";
import { signToken } from "../middleware/AuthHelper";

const jwt = require('jsonwebtoken');

const router = express.Router();
let userRepository = new UserRepository();

router.post("/login", async (req: any, res: any) => {
    const { username, password } = req.body;

    try {
        let user: user = await userRepository.findByUserName(username);

        if (!user) 
            return generateError(res, new AuthException(`Cannot login: User does not exist with ${username}`), errorCodes.AUTHENTICATION_FAILED);
        
        if (!comparePassword(password, user.password)) 
            return generateError(res, new AuthException("Cannot login: Invalid password"), errorCodes.AUTHENTICATION_FAILED);

        if (user.deleted_at)
            return generateError(res, new AuthException("Cannot login: User has been deleted"), errorCodes.AUTHENTICATION_FAILED);

        const token = signToken({id: user.id, username: user.username});

        res.cookie("token", token, {
            httpOnly: true,
        });

        return res.data = res.json({
            message: "User logged in successfully!",
            payload: {
                user: user,
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.post("/logout", async (req: any, res: any) => {
    if (!req.cookies.token)
        return generateError(res, new AuthException("Cannot logout: User not currently logged in"), errorCodes.INVALID_REQUEST);
    
    res.clearCookie("token");

    return res.data = res.json({
        message: "User logged out successfully!",
        payload: {}
    });
});

router.use((req: any, res: any, next: any) => {
    let err = new HttpException("Invalid request method!");
    return generateError(res, err, 405);
});

module.exports = router;
