import express from 'express';
import CommentRepository from '../repositories/CommentRepository';
import CommentException from '../exceptions/CommentException';

import { comment } from "@prisma/client"
import { generateError, isValidId } from "../globals"

const router = express.Router();
let commentRepository = new CommentRepository();

router.post("/", async (req: any, res: any) => {
    const { user_id, post_id, reply_id, content } = req.body;
    // if (!user_id || !post_id || !content)
    //     return generateError(res, "Comment not created.", 400);

    await commentRepository.create({user_id: user_id, post_id: post_id, reply_id: reply_id, content: content})
        .then((comment: comment) => res.data = res.json({
            message: "Comment created successfully!",
            payload: {
                comment: comment
            }
        }))
        .catch((err: any) => {
            generateError(res, err, 400);
        })
});

router.get("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if (isValidId(id))
        return generateError(res, new CommentException(`Cannot retrieve Comment: Invalid ID.`), 400);

    await commentRepository.findById(id)
        .then((comment: comment) => {
            if (!comment) 
                return generateError(res, new CommentException(`Cannot retrieve Comment: Comment does not exist with ID ${id}.`), 400);

            return res.data = res.json({
                message: "Comment retrieved successfully!",
                payload: {
                    comment: comment
                }
            })
        })
        .catch((err: any) => {
            generateError(res, err, 400);
        });
});

router.put("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if (isValidId(id))
        return generateError(res, new CommentException(`Cannot update Comment: Invalid ID.`), 400);

    await commentRepository.update(id, req.body)
        .then((comment: comment) => res.data = res.json({
            message: "Comment updated successfully!",
            payload: {
                comment: comment
            }
        }))
        .catch((err: any) => {
            generateError(res, err, 400);
        });
});

router.delete("/:id", async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 0)
        return generateError(res, new CommentException(`Cannot delete Comment: Invalid ID.`), 400);

    await commentRepository.delete(id)
        .then((comment: comment) => res.data = res.json({
            message: "Comment deleted successfully!",
            payload: {
                comment: comment
            }
        }))
        .catch((err: any) => {
            generateError(res, err, 400);
        });
});

module.exports = router;