import Repository from "../lib/Repository";
import UserRepository from "./UserRepository";
import CategoryRepository from "./CategoryRepository";
import PostException from "../exceptions/PostException";

import { prisma, postType } from "../globals"
import { post } from "@prisma/client";


class PostRepository extends Repository {
    userRepository = new UserRepository();
    categoryRepository = new CategoryRepository();

    constructor() {
        super();
        this.setModel(prisma.post);
    }

    async create(data: any){
        let { title, content, type, user_id, category_id } = data;

        // if ( !title && !content && !user_id && !category_id )
        //     throw new PostException("Cannot create Post: Missing required fields.");
        
        if (await this.userRepository.findById(user_id) == null)
            throw new PostException(`Cannot create Post: User does not exist with ID ${user_id}.`)

        if (await this.categoryRepository.findById(category_id) == null)
            throw new PostException(`Cannot create Post: Category does not exist with ID ${category_id}.`)

        if (!title || title?.trim().length == 0)
            throw new PostException("Cannot create Post: Missing title.");

        if (!content || content?.trim().length == 0)
            throw new PostException("Cannot create Post: Missing content.");

        if (await this.findByTitle(title) != null)
            throw new PostException(`Cannot create Post: Duplicate title.`);

        if (!type || type?.trim().length == 0)
            throw new PostException("Cannot create Post: Missing type.");

        var parsedType = postType[parseInt(type)]

        if (!parsedType)
            throw new PostException("Cannot create Post: Invalid type.");

        return await super.create({...data, type: parsedType}); 
    }

    async findByTitle(title: string){
        try {
            return await this.model.findUnique({
                where: {
                    title: title
                }
            });
        } catch (error) {
            throw error;
        } finally {
            prisma.$disconnect();
        }
    }

    async update(id: number, data: any){
        const { content, type } = data;

        const post: post = await this.findById(id);

        if (!post)
            throw new PostException(`Cannot update Post: Post does not exist with ID ${id}.`);

        if (post.type == "URL")
            throw new PostException("Cannot update Post: Only text posts are editable.");

        if (content.trim().length == 0)
            throw new PostException("Cannot update Post: Missing content.");

        return await super.update(id, data);
    }

    async delete(id: number){
        const post: post = await this.findById(id);

        if (!post)
            throw new PostException(`Cannot delete Post: Post does not exist with ID ${id}.`);

        if (post?.deleted_at != null)
            throw new PostException(`Cannot delete Post: Post has already been deleted.`);

        return await super.delete(id);
    }
}

export default PostRepository;
