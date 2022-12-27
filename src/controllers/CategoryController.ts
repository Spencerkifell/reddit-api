import express from "express";
import CategoryRepository from "../repositories/CategoryRepository";

import { category } from "@prisma/client"
import { generateError, isValidId } from "../globals"
import { verifyUser } from '../middleware/AuthHelper';

import CategoryException from "../exceptions/CategoryException";
import HttpException from "../exceptions/HttpException";
import AuthException from '../exceptions/AuthException';

const router = express.Router();
let categoryRepository = new CategoryRepository();

router.get("/", async (req: any, res: any) => {
    try {
        // Get all categories
        var allCategories: category[] = await categoryRepository.getAll();
        return res.data = res.json({
            message: "Categories retrieved successfully!",
            payload: {
                categories: allCategories
            }
        });
    } catch (error: any) {
        generateError(res, error, 400);
    }
});

router.post('/', async (req: any, res: any) => {
    let categoryData = req.body;

    var verifiedUser = verifyUser(req.cookies.token);

    if (!verifiedUser)
        return generateError(res, new AuthException("Cannot create Category: User not currently logged in"), 400);

    // Convert parameters to correct types as needed
    categoryData = {...categoryData, user_id: verifiedUser.id};

    try {
        // Create category from body data
        var newCategory: category = await categoryRepository.create(categoryData);
        return res.data = res.json({
            message: "Category created successfully!",
            payload: {
                category: newCategory
            }
        });
    } catch (error: any) {
        return generateError(res, error, 400);
    }
});

router.get('/:id', async (req: any, res: any) => {
    let id = parseInt(req.params.id);
    
    if(isValidId(id))
        return generateError(res, new CategoryException(`Cannot retrieve Category: Invalid ID.`), 400);

    try {
        let category: category = await categoryRepository.findById(id);

        if (!category) 
            return generateError(res, new CategoryException(`Cannot retrieve Category: Category with ID ${id} does not exist.`), 400);

        return res.data = res.json({
            message: "Category retrieved successfully!",
            payload: {
                category: category
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.put('/:id', async (req: any, res: any) => {
    let id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new CategoryException(`Cannot update Category: Invalid ID.`), 400);

    var verifiedUser = verifyUser(req.cookies.token);

    if (!verifiedUser)
        return generateError(res, new AuthException("Cannot update Category: User not currently logged in"), 400);

    try {
        var category = await categoryRepository.findById(id);

        if (category.user_id != verifiedUser.id)
            return generateError(res, new AuthException("Cannot update Category: You are unable to modify a category that you didn't create."), 400);

        for (var property in req.body)
            if (category.hasOwnProperty(property))
                category[property] = req.body[property];

        var updatedCategory: category = await categoryRepository.update(id, category);

        return res.data = res.json({
            message: "Category updated successfully!",
            payload: {
                category: updatedCategory
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.delete('/:id', async (req: any, res: any) => {
    let id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new CategoryException(`Cannot delete Category: Invalid ID.`), 400);

    var verifiedUser = verifyUser(req.cookies.token);

    if (!verifiedUser)
        return generateError(res, new AuthException("Cannot delete Category: User not currently logged in"), 400);
    
    try {
        var category: category = await categoryRepository.findById(id);

        if (category.user_id != verifiedUser.id)
            return generateError(res, new AuthException("Cannot delete Category: You are unable to delete a category that you didn't create."), 400);
        
        var deletedCategory: category = await categoryRepository.delete(id);

        return res.data = res.json({
            message: "Category deleted successfully!",
            payload: {
                category: deletedCategory
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