import Repository from "../lib/Repository";
import UserRepository from "./UserRepository";
import CategoryRepository from "./CategoryRepository";
import PostRepository from "./PostRepository";

import { prisma } from "../globals"
import { comment } from "@prisma/client";

import CommentException from "../exceptions/CommentException";

class CommentRepository extends Repository {
    userRepository = new UserRepository();
    categoryRepository = new CategoryRepository();
    postRepository = new PostRepository();

    constructor() {
        super();
        this.setModel(prisma.comment);
    }

    async create(data: any){
        const {user_id, post_id, content} = data;

        // if (!user_id || !post_id || !content)
        //     throw new CommentException("Cannot create Comment: Missing required fields.");

        if (await this.userRepository.findById(user_id) == null)
            throw new CommentException(`Cannot create Comment: User does not exist with ID ${user_id}.`);

        if (await this.postRepository.findById(post_id) == null)
            throw new CommentException(`Cannot create Comment: Post does not exist with ID ${post_id}.`);

        if (content?.trim().length == 0)
            throw new CommentException("Cannot create Comment: Missing content.");

        return await super.create(data);
    }

    async update(id: number, data: any){
        const {content} = data;

        let comment: comment = await this.findById(id);

        if (!comment)
            throw new CommentException(`Cannot update Comment: Comment does not exist with ID ${id}.`);

        if (content?.trim().length == 0)
            throw new CommentException("Cannot update Comment: No update parameters were provided.");

        return await super.update(id, data);
    }

    async delete(id: number){
        const comment: comment = await this.findById(id);

        if (!comment)
            throw new CommentException(`Cannot delete Comment: Comment does not exist with ID ${id}.`);

        if (comment?.deleted_at != null)
            throw new CommentException(`Cannot delete Comment: Comment has already been deleted.`);

        return await super.delete(id);
    }
}

export default CommentRepository;