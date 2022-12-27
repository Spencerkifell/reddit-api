import faker from 'faker';
import UserRepository from '../repositories/UserRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import PostRepository from '../repositories/PostRepository';
import CommentRepository from '../repositories/CommentRepository';
import { prisma } from "../globals"
import { user, category, post, comment } from "@prisma/client"

class TestHelper {
    static generateUserData(username?: string | null, email?: string | null, password?: string | null) {
        return {
            username: username ?? faker.internet.userName(),
            email: email ?? faker.internet.email(),
            password: password ?? faker.internet.password(),
        };
    }

    static async generateCategoryData(user?: user | null, title?: string | null, description?: string | null){
        const categoryUser = user ?? await TestHelper.generateUser();
        const categoryTitle = title ?? faker.lorem.words(5);
        const categoryDescription = description ?? faker.lorem.sentence();

        return {
            user_id: categoryUser.id,
            title: categoryTitle,
            description: categoryDescription
        };
    }

    static async generatePostData(type?: string | null, user?: user, category?: category, title?: string | null, content?: string | null){
        const postType = type ?? (Math.random() < 0.5 ? 'Text' : 'URL');
        const postUser = user ?? await TestHelper.generateUser();
        const postCategory = category ?? await TestHelper.generateCategory(postUser);
        const postTitle = title ?? faker.lorem.words(Math.floor(Math.random() * 5) + 1);
        const postContent = content ?? (postType === 'Text' ? faker.lorem.sentences() : faker.internet.url());

        return {
            user_id: postUser.id,
            category_id: postCategory.id,
            title: postTitle,
            content: postContent,
            type: postType
        };
    }

    static async generateCommentData(user?: user | null, post?: post | null, content?: string | null, reply?: comment | null) {
        const commentUser: user = user ?? await TestHelper.generateUser();
        const commentPost: post = post ?? await TestHelper.generatePost();
        const commentContent = content ?? faker.lorem.paragraph();

        return {
            user_id: commentUser.id,
            post_id: commentPost.id,
            reply_id: reply?.id,
            content: commentContent,
        };
    }

    static async generateComment(user?: user | null, post?: post | null, content?: string | null, reply?: comment | null) {
        const commentRepository = new CommentRepository();
        const commentData = await TestHelper.generateCommentData(user, post, content, reply);
        return await commentRepository.create(commentData);
    }

    static async generatePost(type?: string | null, user?: user, category?: category, title?: string | null, content?: string | null){
        const postRepository = new PostRepository();
        const postData = await TestHelper.generatePostData(type, user, category, title, content);
        return await postRepository.create(postData);
    }

    static async generateCategory(user?: user, title?: string | null, description?: string | null){
        const categoryRepository = new CategoryRepository();
        const categoryData = await TestHelper.generateCategoryData(user, title, description);
        return await categoryRepository.create(categoryData);
    }

    static async generateUser(username = null, email = null, password = null) {
        const userRepository = new UserRepository();
        const userData = TestHelper.generateUserData(username, email, password);
        return await userRepository.create(userData);
    }

    static async generateCategories() {
        let categories: category[] = [];
        const numberOfCategories = Math.floor(Math.random() * 10) + 1;
    
        for (let i = 0; i < numberOfCategories; i++) 
            categories.push(await TestHelper.generateCategory())

        categories.sort((categoryA, categoryB) => categoryA.id - categoryB.id);

        return categories;
    }

    static async generateUsers() {
        let users: user[] = [];
        const numberOfUsers = Math.floor(Math.random() * 10) + 1;

        for (let i = 0; i < numberOfUsers; i++)
            users.push(await TestHelper.generateUser());
        
        users.sort((userA, userB) => userA.id - userB.id);

        return users;
    }

    static async generatePosts() {
        let posts: post[] = [];
        const numberOfPosts = Math.floor(Math.random() * 10) + 1;

        for (let i = 0; i < numberOfPosts; i++)
            posts.push(await TestHelper.generatePost());

        posts.sort((postA, postB) => postA.id - postB.id);

        return posts;
    }

    static async isUserValid(user_id: number) {
        const userRepository = new UserRepository();
        let user: user = await userRepository.findById(user_id);
        return user != null ? user : null;
    }

    static async truncateDatabase(){
        await prisma.comment.deleteMany({});
        await prisma.post.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.$disconnect();
    }
}

export default TestHelper;