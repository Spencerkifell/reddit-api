import { PrismaClient } from '@prisma/client';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const totalSalts = 10;

export const prisma = new PrismaClient();

export const baseUrl = `http://localhost:${process.env.PORT}`;

export enum postType {
    URL,
    Text
}

export const errorCodes = {
    AUTHENTICATION_FAILED: 401,
    INVALID_REQUEST: 400,
    NOT_FOUND: 404,
    OK: 200,
}

export const generateError = (response: any, error: any, statusCode: number) => {
    response.status(statusCode).send({
        name: error.name,
        message: error.message,
        payload: {}
    });
}

export const isValidId = (id: number) => {
    return isNaN(id) || id < 0;
}

export const isUserEqual = (user: any, updatedUser: any) => {
    for (var property in user)
        if (user[property] != updatedUser[property])
            return false;
    return true;
};

export const encryptPassword = (password: string) => {
    return bcrypt.hashSync(password, totalSalts);
};

export const comparePassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
};


