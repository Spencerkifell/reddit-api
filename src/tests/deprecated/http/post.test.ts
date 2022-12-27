import axios from 'axios';
import TestHelper from '../../TestHelper';

import { post } from "@prisma/client";
import { baseUrl } from "../../../globals";
const { generatePostData, generatePost, truncateDatabase } = TestHelper;

beforeEach(async () => {
  await truncateDatabase();
});

test('Post created successfully.', async () => {
    const postData = await generatePostData();
    const response = await axios({method: 'post', url: `${baseUrl}/post`, data: postData});
    let { message, payload } = response.data;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Post created successfully!');
    expect(Object.keys(payload.post).includes('id')).toBe(true);
    expect(Object.keys(payload.post).includes('title')).toBe(true);
    expect(Object.keys(payload.post).includes('content')).toBe(true);
    expect(Object.keys(payload.post).includes('user_id')).toBe(true);
    expect(Object.keys(payload.post).includes('category_id')).toBe(true);
    expect(payload.post.title).toBe(postData.title);
    expect(payload.post.content).toBe(postData.content);
    expect(payload.post.user_id).toBe(postData.user_id);
    expect(payload.post.category_id).toBe(postData.category_id);
    expect(payload.post.created_at).not.toBeNull();
    expect(payload.post.edited_at).toBeNull();
    expect(payload.post.deleted_at).toBeNull();
});

test('Post not created with non-existant user.', async () => {
    let throwError = null;
    const postData = await generatePostData();

    postData.user_id = 999;

    await axios({method: 'post', url: `${baseUrl}/post`, data: postData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot create Post: User does not exist with ID ${postData.user_id}.`);
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Post not created with non-existant category.', async () => {
    let throwError = null;
    const postData = await generatePostData();

    postData.category_id = 999;

    await axios({method: 'post', url: `${baseUrl}/post`, data: postData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot create Post: Category does not exist with ID ${postData.category_id}.`);
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Post not created with blank title.', async () => {
    let throwError = null;
    const postData = await generatePostData();

    postData.title = '';

    await axios({method: 'post', url: `${baseUrl}/post`, data: postData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create Post: Missing title.');
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Post not created with blank type.', async () => {
    let throwError = null;
    const postData = await generatePostData();

    postData.type = '';

    await axios({method: 'post', url: `${baseUrl}/post`, data: postData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create Post: Missing type.');
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Post not created with blank content.', async () => {
    let throwError = null;
    const postData = await generatePostData();

    postData.content = '';

    await axios({method: 'post', url: `${baseUrl}/post`, data: postData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create Post: Missing content.');
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Post found by ID.', async () => {
    const post: post = await generatePost();

    const response: any = await axios({method: 'get', url: `${baseUrl}/post/${post.id}`});
    const { payload, message } = response.data;
    const retrievedPost: post = payload.post;

    expect(response.status).toBe(200);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Post retrieved successfully!');
    expect(Object.keys(retrievedPost).includes('id')).toBe(true);
    expect(Object.keys(retrievedPost).includes('title')).toBe(true);
    expect(Object.keys(retrievedPost).includes('content')).toBe(true);
    expect(Object.keys(retrievedPost).includes('user_id')).toBe(true);
    expect(Object.keys(retrievedPost).includes('category_id')).toBe(true);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.content).toBe(post.content);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.category_id).toBe(post.category_id);
    expect(retrievedPost.created_at).not.toBeNull();
    expect(retrievedPost.edited_at).toBeNull();
    expect(retrievedPost.deleted_at).toBeNull();
});

test('Post not found by wrong ID.', async () => {
    let throwError = null;
    const postId = Math.floor(Math.random() * 100) + 1;

    await axios({method: 'get', url: `${baseUrl}/post/${postId}`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot retrieve Post: Post does not exist with ID ${postId}.`);
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Post (Text) content updated successfully.', async () => {
    const post: post = await generatePost("Text");
    const { content } = await generatePostData();

    let response = await axios({method: 'put', url: `${baseUrl}/post/${post.id}`, data: {content}});
    let { payload, message } = response.data;
    let retrievedPost: post = payload.post;

    expect(response.status).toBe(200);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Post updated successfully!');
    expect(Object.keys(retrievedPost).includes('id')).toBe(true);
    expect(Object.keys(retrievedPost).includes('title')).toBe(true);
    expect(Object.keys(retrievedPost).includes('content')).toBe(true);
    expect(Object.keys(retrievedPost).includes('user_id')).toBe(true);
    expect(Object.keys(retrievedPost).includes('category_id')).toBe(true);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.content).toBe(content);
    expect(retrievedPost.content).not.toBe(post.content);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.category_id).toBe(post.category_id);

    response = await axios({method: 'get', url: `${baseUrl}/post/${post.id}`});
    payload = response.data.payload;
    retrievedPost = payload.post;

    expect(response.status).toBe(200);
    expect(retrievedPost.content).toBe(content);
    expect(retrievedPost.created_at).not.toBeNull();
    expect(retrievedPost.edited_at).not.toBeNull();
    expect(retrievedPost.deleted_at).toBeNull();
});

test('Post (Text) not updated with non-existant ID.', async () => {
    let throwError = null;

    await axios({method: 'put', url: `${baseUrl}/post/0`, data: {content: 'Text'}})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot update Post: Post does not exist with ID 0.`);
            expect(payload).toMatchObject({});
        });

    expect(throwError).not.toBeNull();
});

test('Post (Text) not updated with blank content.', async () => {
    let throwError = null;
    const post: post = await generatePost("Text");
    post.content = '';

    await axios({method: 'put', url: `${baseUrl}/post/${post.id}`, data: post})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot update Post: Missing content.');
            expect(payload).toMatchObject({});
        });
        
    expect(throwError).not.toBeNull();
});

test('Post (URL) not updated.', async () => {
    let throwError = null;
    const post = await generatePost("URL");
    
    throwError = null;
    await axios({method: 'put', url: `${baseUrl}/post/${post.id}`, data: {content: 'https://pokemon.com'}})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot update Post: Only text posts are editable.');
            expect(payload).toMatchObject({});
        });
    
    expect(throwError).not.toBeNull();
});

test('Post deleted successfully.', async () => {
    const post: post = await generatePost();

    let response = await axios({method: 'delete', url: `${baseUrl}/post/${post.id}`});
    let { payload, message } = response.data;
    let retrievedPost: post = payload.post;

    expect(response.status).toBe(200);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Post deleted successfully!');
    expect(Object.keys(retrievedPost).includes('id')).toBe(true);
    expect(Object.keys(retrievedPost).includes('title')).toBe(true);
    expect(Object.keys(retrievedPost).includes('content')).toBe(true);
    expect(Object.keys(retrievedPost).includes('user_id')).toBe(true);
    expect(Object.keys(retrievedPost).includes('category_id')).toBe(true);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.content).toBe(post.content);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.category_id).toBe(post.category_id);

    response = await axios({method: 'get', url: `${baseUrl}/post/${post.id}`});
    payload = response.data.payload;
    retrievedPost = payload.post;

    expect(response.status).toBe(200);
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.content).toBe(post.content);
    expect(retrievedPost.created_at).not.toBeNull();
    expect(retrievedPost.edited_at).toBeNull();
    expect(retrievedPost.deleted_at).not.toBeNull();
});

test('Post not deleted with non-existant ID.', async () => {
    let throwError = null;

    await axios({method: 'delete', url: `${baseUrl}/post/0`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot delete Post: Post does not exist with ID 0.`);
            expect(payload).toMatchObject({});
        });
    
        expect(throwError).not.toBeNull();
});

afterAll(async () => {
  await truncateDatabase();
});