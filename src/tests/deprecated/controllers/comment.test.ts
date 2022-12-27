import axios from 'axios';
import TestHelper from '../../TestHelper';
import { user, category, post, comment } from "@prisma/client"
import { baseUrl } from "../../../globals";

const { generateUser, generateCategory, generatePost, generateComment, generateCommentData, truncateDatabase } = TestHelper;

let user: user;
let category: category;
let post: post;

beforeEach(async () => {
    user = await generateUser();
    category = await generateCategory(user);
    post = await generatePost(null, user, category);
});

test('CommentController handled a POST request.', async () => {
    const commentData = await generateCommentData(user, post);

    let response = await axios({method: 'post', url: `${baseUrl}/comment`, data: commentData});
    const { payload, message } = response.data;
    let comment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(message).toBe('Comment created successfully!');
    expect(comment.content).toBe(commentData.content);
    expect(comment.user_id).toBe(user.id);
    expect(comment.post_id).toBe(post.id);
});

test('CommentController handled a GET request.', async () => {
    const comment = await generateComment();

    let response = await axios({method: 'get', url: `${baseUrl}/comment/${comment.id}`});
    const { payload, message } = response.data;

    let retrievedComment: comment = payload.comment;
    retrievedComment.created_at = new Date(retrievedComment.created_at);
    retrievedComment.edited_at = retrievedComment.edited_at != null ? new Date(retrievedComment.edited_at) : null;
    retrievedComment.deleted_at = retrievedComment.deleted_at != null ? new Date(retrievedComment.deleted_at) : null;

    expect(response.status).toBe(200);
    expect(message).toBe('Comment retrieved successfully!');
    expect(retrievedComment.id).toBe(comment.id);
    expect(retrievedComment.content).toBe(comment.content);
    expect(retrievedComment.user_id).toBe(comment.user_id);
    expect(retrievedComment.post_id).toBe(comment.post_id);
    expect(retrievedComment.created_at).toBeInstanceOf(Date);
    expect(retrievedComment.edited_at).toBeNull();
    expect(retrievedComment.deleted_at).toBeNull();
});

test('CommentController threw an exception handling a GET request with non-existant ID.', async () => {
    let throwError = null;
    const commentId = 999;

    await axios({method: 'get', url: `${baseUrl}/comment/${commentId}`})
        .catch((error: any) => {
            throwError = error;

            let { name, message } = throwError.response.data;
            expect(error.response.status).toBe(400);
            expect(name).toBe('CommentException');
            expect(message).toBe(`Cannot retrieve Comment: Comment does not exist with ID ${commentId}.`);
        });

    expect(throwError).not.toBeNull();
});

test('CommentController handled a PUT request.', async () => {
    const comment = await generateComment();

    const { content: newContent } = await generateCommentData();

    let response = await axios({method: 'put', url: `${baseUrl}/comment/${comment.id}`, data: { content: newContent }});
    let { payload, message } = response.data;
    let updatedComment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(message).toBe('Comment updated successfully!');
    expect(updatedComment.id).toBe(comment.id);
    expect(updatedComment.content).toBe(newContent);
    expect(updatedComment.content).not.toBe(comment.content);
    expect(updatedComment.user_id).toBe(comment.user_id);
    expect(updatedComment.post_id).toBe(comment.post_id);

    response = await axios({method: 'get', url: `${baseUrl}/comment/${comment.id}`});
    payload = response.data.payload;
    message = response.data.message;

    let retrievedComment = payload.comment;
    retrievedComment.created_at = new Date(retrievedComment.created_at);
    retrievedComment.edited_at = retrievedComment.edited_at != null ? new Date(retrievedComment.edited_at) : null;
    retrievedComment.deleted_at = retrievedComment.deleted_at != null ? new Date(retrievedComment.deleted_at) : null;

    expect(response.status).toBe(200);
    expect(retrievedComment.id).toBe(comment.id);
    expect(retrievedComment.content).toBe(newContent);
    expect(retrievedComment.content).not.toBe(comment.content);
    expect(retrievedComment.user_id).toBe(comment.user_id);
    expect(retrievedComment.post_id).toBe(comment.post_id);
    expect(retrievedComment.created_at).toBeInstanceOf(Date);
    expect(retrievedComment.edited_at).toBeInstanceOf(Date);
    expect(retrievedComment.deleted_at).toBeNull();
});

test('CommentController threw an exception handling a PUT request with non-existant ID.', async () => {
    let throwError = null;
    const commentId = 999;
    let { content } = await generateCommentData();

    await axios({method: 'put', url: `${baseUrl}/comment/${commentId}`, data: { content }})
        .catch((error: any) => {
            throwError = error;

            let { name, message } = throwError.response.data;
            expect(error.response.status).toBe(400);
            expect(name).toBe('CommentException');
            expect(message).toBe(`Cannot update Comment: Comment does not exist with ID ${commentId}.`);
        });

    expect(throwError).not.toBeNull();
});

test('Comment Controller handled a DELETE request.', async () => {
    const comment = await generateComment();

    let response = await axios({method: 'delete', url: `${baseUrl}/comment/${comment.id}`});
    let { payload, message } = response.data;
    let deletedComment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(message).toBe('Comment deleted successfully!');
    expect(deletedComment.id).toBe(comment.id);
    expect(deletedComment.content).toBe(comment.content);
    expect(deletedComment.user_id).toBe(comment.user_id);
    expect(deletedComment.post_id).toBe(comment.post_id);

    response = await axios({method: 'get', url: `${baseUrl}/comment/${comment.id}`});
    payload = response.data.payload;
    message = response.data.message;

    let retrievedComment: comment = payload.comment;
    retrievedComment.created_at = new Date(retrievedComment.created_at);
    retrievedComment.edited_at = retrievedComment.edited_at != null ? new Date(retrievedComment.edited_at) : null;
    retrievedComment.deleted_at = retrievedComment.deleted_at != null ? new Date(retrievedComment.deleted_at) : null;

    expect(response.status).toBe(200);
    expect(retrievedComment.id).toBe(comment.id);
    expect(retrievedComment.content).toBe(comment.content);
    expect(retrievedComment.user_id).toBe(comment.user_id);
    expect(retrievedComment.post_id).toBe(comment.post_id);
    expect(retrievedComment.created_at).toBeInstanceOf(Date);
    expect(retrievedComment.edited_at).toBeNull();
    expect(retrievedComment.deleted_at).toBeInstanceOf(Date);
});

test('CommentController threw an exception handling a DELETE request with non-existant ID.', async () => {
    let throwError = null;
    const commentId = 999;

    await axios({method: 'delete', url: `${baseUrl}/comment/${commentId}`})
        .catch((error: any) => {
            throwError = error;

            let { name, message } = throwError.response.data;
            expect(error.response.status).toBe(400);
            expect(name).toBe('CommentException');
            expect(message).toBe(`Cannot delete Comment: Comment does not exist with ID ${commentId}.`);
        });

    expect(throwError).not.toBeNull();
});

afterAll(async () => {
    await truncateDatabase();
});