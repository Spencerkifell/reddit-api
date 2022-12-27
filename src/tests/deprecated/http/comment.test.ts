import axios from 'axios';
import TestHelper from '../../TestHelper';

import { comment } from "@prisma/client";
import { baseUrl } from '../../../globals';
const { generateComment, generateCommentData, truncateDatabase } = TestHelper;

beforeEach(async () => {
	await truncateDatabase();
});

test('Comment created successfully.', async () => {

    const commentData = await generateCommentData();
    const response = await axios.post(`${baseUrl}/comment`, commentData);

    const { message, payload } = response.data;
    const comment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Comment created successfully!');
    expect(Object.keys(payload).includes('comment')).toBe(true);
    expect(Object.keys(comment).includes('id')).toBe(true);
    expect(Object.keys(comment).includes('content')).toBe(true);
    expect(Object.keys(comment).includes('user_id')).toBe(true);
    expect(Object.keys(comment).includes('post_id')).toBe(true);
    expect(comment.content).toBe(commentData.content);
    expect(comment.user_id).toBe(commentData.user_id);
    expect(comment.post_id).toBe(commentData.post_id);
    expect(comment.created_at).not.toBeNull();
    expect(comment.edited_at).toBeNull();
    expect(comment.deleted_at).toBeNull();
});

test('Comment not created with non-existant user.', async () => {
    let throwError = null;
	const commentData = await generateCommentData();

	commentData.user_id = 999;

    await axios.post(`${baseUrl}/comment`, commentData)
        .catch(error => {
            throwError = error;
            const response = error.response;
            const { payload, message } = response.data;

            expect(error.response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot create Comment: User does not exist with ID ${commentData.user_id}.`);
            expect(payload).toMatchObject({});
        })

        expect(throwError).not.toBeNull();
});

test('Comment not created with non-existant post.', async () => {
    let throwError = null;
	const commentData = await generateCommentData();

    commentData.post_id = 999;

    await axios.post(`${baseUrl}/comment`, commentData)
        .catch((error) => {
            throwError = error;
            const response = error.response;
            const { payload, message } = response.data;

            expect(error.response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot create Comment: Post does not exist with ID ${commentData.post_id}.`);
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Comment not created with blank content.', async () => {
    let throwError = null;
	const commentData = await generateCommentData();

	commentData.content = '';

    await axios({method: 'post', url: `${baseUrl}/comment`, data: commentData})
        .catch((error) => {
            throwError = error;
            const response = error.response;
            const { payload, message } = response.data;

            expect(error.response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot create Comment: Missing content.`);
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('Comment found by ID.', async () => {
	const createdComment: comment = await generateComment();

    const response = await axios({method: 'get', url: `${baseUrl}/comment/${createdComment.id}`});

    const { message, payload } = response.data;
    const retrievedComment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Comment retrieved successfully!');

    expect(Object.keys(payload).includes('comment')).toBe(true);
    expect(Object.keys(retrievedComment).includes('id')).toBe(true);
    expect(Object.keys(retrievedComment).includes('content')).toBe(true);
    expect(Object.keys(retrievedComment).includes('user_id')).toBe(true);
    expect(Object.keys(retrievedComment).includes('post_id')).toBe(true);
    expect(retrievedComment.id).toBe(createdComment.id);
    expect(retrievedComment.content).toBe(createdComment.content);
    expect(retrievedComment.user_id).toBe(createdComment.user_id);
    expect(retrievedComment.post_id).toBe(createdComment.post_id);
    expect(retrievedComment.created_at).not.toBeNull();
    expect(retrievedComment.edited_at).toBeNull();
    expect(retrievedComment.deleted_at).toBeNull();
});

test('Comment not found by wrong ID.', async () => {
    let throwError = null;
	const commentId = Math.floor(Math.random() * 100) + 1;

    await axios({method: 'get', url: `${baseUrl}/comment/${commentId}`})
        .catch((error) => {
            throwError = error;
            const response = error.response;
            const { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot retrieve Comment: Comment does not exist with ID ${commentId}.`);
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Comment updated successfully.', async () => {
    const createdComment: comment = await generateComment();
    const commentData = await generateCommentData();

    const { content: newCommentContent} = await generateCommentData();

    let response = await axios({method: 'put', url: `${baseUrl}/comment/${createdComment.id}`, data: { content: newCommentContent }});
    let { message, payload } = response.data;
    const updatedComment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Comment updated successfully!');
    expect(Object.keys(updatedComment).includes('id')).toBe(true);
    expect(Object.keys(updatedComment).includes('content')).toBe(true);
    expect(Object.keys(updatedComment).includes('user_id')).toBe(true);
    expect(Object.keys(updatedComment).includes('post_id')).toBe(true);
    expect(updatedComment.id).toBe(createdComment.id);
    expect(updatedComment.content).toBe(newCommentContent);
    expect(updatedComment.content).not.toBe(createdComment.content);
    expect(updatedComment.user_id).toBe(createdComment.user_id);
    expect(updatedComment.post_id).toBe(createdComment.post_id);

    response = await axios({method: 'get', url: `${baseUrl}/comment/${createdComment.id}`});
    message = response.data.message;
    payload = response.data.payload;
    const retrievedComment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(retrievedComment.content).toBe(newCommentContent);
    expect(retrievedComment.created_at).not.toBeNull();
    expect(retrievedComment.edited_at).not.toBeNull();
    expect(retrievedComment.deleted_at).toBeNull();
});

test('Comment not updated with non-existant ID.', async () => {
    let throwError = null;
    const commentId = Math.floor(Math.random() * 100) + 1;

    await axios({method: 'put', url: `${baseUrl}/comment/${commentId}`, data: { content: 'New comment content' }})
        .catch((error) => {
            throwError = error;
            const response = error.response;
            const { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot update Comment: Comment does not exist with ID ${commentId}.`);
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Comment not updated with blank content.', async () => {
    let throwError = null;
    const createdComment: comment = await generateComment();

    await axios({method: 'put', url: `${baseUrl}/comment/${createdComment.id}`, data: { content: '' }})
        .catch((error) => {
            throwError = error;
            const response = error.response;
            const { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot update Comment: No update parameters were provided.`);
            expect(payload).toMatchObject({});
        });
    
    expect(throwError).not.toBeNull();
});

test('Comment deleted successfully.', async () => {
	const comment: comment = await generateComment();

    let response = await axios({method: 'delete', url: `${baseUrl}/comment/${comment.id}`});
    let { message, payload } = response.data;
    const deletedComment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Comment deleted successfully!');
    expect(Object.keys(deletedComment).includes('id')).toBe(true);
    expect(Object.keys(deletedComment).includes('content')).toBe(true);
    expect(Object.keys(deletedComment).includes('user_id')).toBe(true);
    expect(Object.keys(deletedComment).includes('post_id')).toBe(true);
    expect(deletedComment.id).toBe(comment.id);
    expect(deletedComment.content).toBe(comment.content);
    expect(deletedComment.user_id).toBe(comment.user_id);
    expect(deletedComment.post_id).toBe(comment.post_id);
    
    response = await axios({method: 'get', url: `${baseUrl}/comment/${comment.id}`});
    message = response.data.message;
    payload = response.data.payload;
    const retrievedComment: comment = payload.comment;

    expect(response.status).toBe(200);
    expect(retrievedComment.content).toBe(comment.content);
    expect(retrievedComment.created_at).not.toBeNull();
    expect(retrievedComment.edited_at).toBeNull();
    expect(retrievedComment.deleted_at).not.toBeNull();
});

test('Comment not deleted with non-existant ID.', async () => {
    let throwError = null;
    const commentId = Math.floor(Math.random() * 100) + 1;

    await axios({method: 'delete', url: `${baseUrl}/comment/${commentId}`})
        .catch((error) => {
            throwError = error;
            const response = error.response;
            const { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot delete Comment: Comment does not exist with ID ${commentId}.`);
            expect(payload).toMatchObject({});
        }); 

    expect(throwError).not.toBeNull();
});

afterAll(async () => {
	await truncateDatabase();
});