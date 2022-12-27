const jwt = require('jsonwebtoken');

export const signToken = (user: any) => {
    return jwt.sign(user, process.env.PRIVATE_KEY, { expiresIn: '1h' });
}

export const verifyUser = (token: string) => {
    try {
        return jwt.verify(token, process.env.PRIVATE_KEY);
    } catch (err: any) {
        return false;
    }
}