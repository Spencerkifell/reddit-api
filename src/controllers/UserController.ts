import express from 'express';
import UserRepository from '../repositories/UserRepository';
import UserException from '../exceptions/UserException';
import HttpException from '../exceptions/HttpException';

import { user } from "@prisma/client";
import { generateError, isValidId, isUserEqual } from "../globals";
import { verifyUser, signToken } from '../middleware/AuthHelper';
import AuthException from '../exceptions/AuthException';

const router = express.Router();
let userRepository = new UserRepository();

router.get("/", async (req: any, res: any) => {
    try {
        var users: user[] = await userRepository.getAll();

        return res.data = res.json({
            message: "Users retrieved successfully!",
            payload: {
                users: users
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.post('/', async (req: any, res: any) => {
    const { username, email, password } = req.body;

    try {
        let user: user = await userRepository.create({username: username, email: email, password: password});
    
        return res.data = res.json({
            message: "User created successfully!",
            payload: {
                user: user
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});


router.get("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new UserException(`Cannot retrieve User: Invalid ID`), 400);

    var verifiedUser = verifyUser(req.cookies.token);

    if (!verifiedUser)
        return generateError(res, new AuthException("Cannot retrieve User: User not currently logged in"), 400);

    if (verifiedUser.id != id)
        return generateError(res, new AuthException("Cannot retrieve User: You are unable to retrieve a user other than yourself"), 400);
    
    try {
        var user: user = await userRepository.findById(id);

        if (!user)
            return generateError(res, new UserException(`Cannot retrieve User: User with ID ${id} does not exist`), 400);

        return res.data = res.json({
            message: "User retrieved successfully!",
            payload: {
                user: user
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.put("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new UserException(`Cannot update User: Invalid ID`), 400);

    var verifiedUser = verifyUser(req.cookies.token);

    if (!verifiedUser)
        return generateError(res, new AuthException("Cannot update User: User not currently logged in"), 400);

    if (verifiedUser.id != id)
        return generateError(res, new AuthException("Cannot update User: You are unable to modify a user other than yourself"), 400);

    var updatedProperties: any = {};
    var user = await userRepository.findById(id);

    for (var property in req.body)
        if (user.hasOwnProperty(property))
            updatedProperties[property] = req.body[property];

    try {
        var updatedUser = await userRepository.update(id, updatedProperties);

        res.cookie("token", signToken({id: updatedUser.id, username: updatedUser.username}), {
            httpOnly: true,
        });

        return res.data = res.json({
            message: "User updated successfully!",
            payload: {
                user: updatedUser,
            }
        })
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.delete("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new UserException(`Cannot delete User: Invalid ID`), 400)

    var verifiedUser = verifyUser(req.cookies.token);

    if (!verifiedUser)
        return generateError(res, new AuthException("Cannot delete User: User not currently logged in"), 400);

    if (verifiedUser.id != id)
        return generateError(res, new AuthException("Cannot delete User: You are unable to delete a user other than yourself"), 400);

    try {
        let user: user = await userRepository.delete(id);

        // Since the user is deleted, we also need to forcefully de-authenticate the user
        res.clearCookie("token");

        return res.data = res.json({
            message: "User deleted successfully!",
            payload: {
                user: user,
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.use((req: any, res: any, next: any) => {
    let err = new HttpException("Invalid request method!");
    return generateError(res, err, 405);
});

module.exports = router;