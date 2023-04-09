import express from 'express';
import PostRepository from '../repositories/PostRepository';
import PostException from '../exceptions/PostException';
import HttpException from '../exceptions/HttpException';

import { post, post_type } from "@prisma/client"
import { generateError, isValidId } from "../globals"
import { verifyUser } from '../middleware/AuthHelper';
import AuthException from '../exceptions/AuthException';

const router = express.Router();
let postRepository = new PostRepository();

router.get("/", async (req: any, res: any) => {
    // Get All Posts
    await postRepository.getAll()
        .then((posts: post[]) => res.data = res.json({
            message: "Posts retrieved successfully!",
            payload: {
                posts: posts
            }
        }))
        .catch((err: any) => {
           generateError(res, "Posts not retrieved.", 400);
        });
});

router.get("/category/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new PostException(`Cannot retrieve Posts: Invalid Category ID.`), 400);

    try {
        var posts: post[] = await postRepository.getAllByCategory(id);
        return res.data = res.json({
            message: "Posts retrieved successfully!",
            payload: {
                posts: posts
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.post("/", async (req: any, res: any) => {
    let postData = req.body;

    const parsed_category_id = parseInt(postData.category_id);

    if (isValidId(parsed_category_id))
        return generateError(res, new PostException(`Cannot create Post: Invalid Category ID.`), 400);

    var verifiedUser = verifyUser(req.cookies.token);

    if (!verifiedUser)
        return generateError(res, new AuthException("Cannot create Post: User not currently logged in"), 400);

    // Convert parameters to correct types as needed
    postData = {...postData, user_id: verifiedUser.id, category_id: parsed_category_id};

    try {
        // Create post from body data
        var newPost: post = await postRepository.create(postData);
        return res.data = res.json({
            message: "Post created successfully!",
            payload: {
                post: newPost
            }
        });
    } catch (err: any) {
        return generateError(res, err, 400);
    }
});

router.get("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new PostException(`Cannot retrieve Post: Invalid ID.`), 400);

    await postRepository.findById(id)
        .then((post: post) => {
            if (!post) 
                return generateError(res, new PostException(`Cannot retrieve Post: Post does not exist with ID ${id}.`), 400);
            
            return res.data = res.json({
                message: "Post retrieved successfully!",
                payload: {
                    post: post
                }
            })
        })
        .catch((err: any) => {
            return generateError(res, err.message, 400)
        });
});

router.put("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new PostException(`Cannot update Post: Invalid ID.`), 400);

    await postRepository.update(id, req.body)
        .then((post: post) => res.data = res.json({
            message: "Post updated successfully!",
            payload: {
                post: post
            }
        }))
        .catch((err: any) => {
            return generateError(res, err, 400)
        });
});

router.delete("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if(isValidId(id))
        return generateError(res, new PostException(`Cannot delete Post: Invalid ID.`), 400);

    await postRepository.delete(id)
        .then((post: post) => res.data = res.json({
            message: "Post deleted successfully!",
            payload: {
                post: post
            }
        }))
        .catch((err: any) => {
            return generateError(res, err, 400);
        });
});

router.use((req: any, res: any, next: any) => {
    let err = new HttpException("Invalid request method!");
    return generateError(res, err, 405);
});

module.exports = router;