import faker from 'faker';
import UserRepository from "../../../repositories/UserRepository"
import CategoryRepository from "../../../repositories/CategoryRepository"
import PostRepository from "../../../repositories/PostRepository"
import CommentRepository from "../../../repositories/CommentRepository"
import TestHelper from "../../TestHelper"
import { prisma } from "../../../globals"
import { user, category, post, comment } from "@prisma/client"

const { truncateDatabase, generateComment, generateCommentData, generateUser, generateCategory, generatePost } = TestHelper

let userRepository = new UserRepository()
let categoryRepository = new CategoryRepository()
let postRepository = new PostRepository()
let commentRepository = new CommentRepository()

let user: user;
let category: category;
let post: post;

beforeEach(async () => {
    user = await generateUser();
    category = await generateCategory(user);
    // TODO Make these helper methods take in objects instead so that we can pass in the user and category without the type.
    post = await generatePost(null, user, category);
});

test('Comment was created successfully.', async () => {
    const content = faker.lorem.paragraph();

    const comment: comment = await generateComment(user, post, content);

    expect(comment.content).toBe(content);
    expect(comment.user_id).toBe(user.id);
    expect(comment.post_id).toBe(post.id);
    expect(comment.reply_id).toBeNull();
});

test('Comment reply was created successfully.', async () => {
    const comment: comment = await generateComment(user, post);
    const reply: comment = await generateComment(user, post, null, comment);

    expect(reply.id).toBe(comment.id + 1);
    expect(reply.reply_id).toBe(comment.id);
});

test('Comment was not created with non-existant user.', async () => {
    await commentRepository.create({user_id: user.id + 1, post_id: post.id, content: faker.lorem.paragraph()})
        .catch(error => {
            expect(error.name).toBe('CommentException');
            expect(error.message).toBe(`Cannot create Comment: User does not exist with ID ${user.id + 1}.`)
        });
});

test('Comment was not created with non-existant post.', async () => {
    await commentRepository.create({user_id: user.id, post_id: post.id + 1, content: faker.lorem.paragraph()})
        .catch(error => { 
            expect(error.name).toBe('CommentException');
            expect(error.message).toBe(`Cannot create Comment: Post does not exist with ID ${post.id + 1}.`)
        });
});

test('Comment was not created with blank content.', async () => {
    await commentRepository.create({user_id: user.id, post_id: post.id, content: ''})
        .catch(error => { 
            expect(error.name).toBe('CommentException');
            expect(error.message).toBe('Cannot create Comment: Missing content.');
        });
});

test('Comment was found by ID.', async () => {
    const newComment: comment = await generateComment(user, post);

    const retrievedComment: comment = await commentRepository.findById(newComment.id);

    expect(retrievedComment.content).toMatch(newComment.content);
    expect(retrievedComment.created_at).toBeInstanceOf(Date);
    expect(retrievedComment.edited_at).toBeNull();
    expect(retrievedComment.deleted_at).toBeNull();
});

test('Comment was not found by wrong ID.', async () => {
    const newComment: comment = await generateComment(user, post);

    const retrievedComment: comment = await commentRepository.findById(newComment.id + 1);

    expect(retrievedComment).toBeNull();
});

test('Comment was updated successfully.', async () => {
    const content = faker.lorem.paragraph();

    const comment: comment = await generateComment(user, post);

    const newCommentContent = faker.lorem.paragraph();

    comment.content = newCommentContent;
    expect(comment.edited_at).toBeNull();

    const wasUpdated = await commentRepository.update(comment.id, comment);
    expect(wasUpdated != null).toBe(true);

    const retrievedComment: comment = await commentRepository.findById(comment.id);

    expect(retrievedComment.content).toMatch(newCommentContent);
    expect(retrievedComment.content).not.toMatch(content);
    expect(retrievedComment.created_at).toBeInstanceOf(Date);
    expect(retrievedComment.edited_at).toBeInstanceOf(Date);
    expect(retrievedComment.deleted_at).toBeNull();
});

test('Comment was not updated with blank content.', async () => {
    const comment: comment = await generateComment(user, post);

    comment.content = '';

    await commentRepository.update(comment.id, comment)
        .catch((error) => {
            expect(error.name).toBe('CommentException');
            expect(error.message).toBe('Cannot update Comment: No update parameters were provided.');
        });
});

test('Comment was deleted successfully.', async () => {
    const comment: comment = await generateComment(user, post);

    expect(comment.deleted_at).toBeNull();

    const wasDeleted = await commentRepository.delete(comment.id);

    expect(wasDeleted != null).toBe(true);

    const retrievedComment: comment = await commentRepository.findById(comment.id);

    expect(retrievedComment.created_at).toBeInstanceOf(Date);
    expect(retrievedComment.edited_at).toBeNull();
    expect(retrievedComment.deleted_at).toBeInstanceOf(Date);
});

afterAll(async () => {
    await truncateDatabase();
});