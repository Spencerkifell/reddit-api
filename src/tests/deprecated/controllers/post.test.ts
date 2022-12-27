import axios from 'axios';
import TestHelper from '../../TestHelper';
import { user, category, post } from "@prisma/client";
import { baseUrl } from "../../../globals";

const { generateUser, generateCategory, generatePost, generatePostData, truncateDatabase } = TestHelper;

let user: user;
let category: category;

beforeEach(async () => {
    await truncateDatabase();

    user = await generateUser();
    category = await generateCategory(user);
});

test('PostController handled a POST request.', async () => {
    const postData = await generatePostData(null, user, category);

    const response = await axios({method: 'post', url: `${baseUrl}/post`, data: postData});
    const { payload, message } = response.data;
    const post: post = payload.post;

    expect(response.status).toBe(200);
    expect(message).toBe('Post created successfully!');
    expect(post.title).toBe(postData.title);
    expect(post.content).toBe(postData.content);
    expect(post.category_id).toBe(postData.category_id);
    expect(post.user_id).toBe(postData.user_id);
});

test('PostController handled a GET request.', async () => {
    const post = await generatePost();

    const response = await axios({method: 'get', url: `${baseUrl}/post/${post.id}`});
    const { payload } = response.data;
    const retrievedPost: post = payload.post;
    retrievedPost.created_at = new Date(retrievedPost.created_at);

    expect(response.status).toBe(200);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.content).toBe(post.content);
    expect(retrievedPost.category_id).toBe(post.category_id);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.created_at).toEqual(post.created_at);
    expect(retrievedPost.edited_at).toBeNull();
    expect(retrievedPost.deleted_at).toBeNull();
});

test('PostController threw an exception handling a GET request with non-existant ID.', async () => {
    let throwError = null;
    const postId = 999;

    await axios({method: 'get', url: `${baseUrl}/post/${postId}`})
        .catch((error) => {
            throwError = error;
            const { name, message } = error.response.data;

            expect(error.response.status).toBe(400);
            expect(name).toBe('PostException');
            expect(message).toBe(`Cannot retrieve Post: Post does not exist with ID ${postId}.`);
        });

    expect(throwError).not.toBeNull();
});

test('PostController threw an exception handling a PUT request with non-existant ID.', async () => {
    let throwError = null;
    const postId = 999;
    const { title } = await generatePostData(null, user, category);

    await axios({method: 'put', url: `${baseUrl}/post/${postId}`, data: {title}})
        .catch((error) => {
            throwError = error;
            const { name, message } = error.response.data;

            expect(error.response.status).toBe(400);
            expect(name).toBe('PostException');
            expect(message).toBe(`Cannot update Post: Post does not exist with ID ${postId}.`);
        });

    expect(throwError).not.toBeNull();
});

test('PostController handled a PUT request.', async () => {
    const post = await generatePost("Text");
    const { content: newPostContent } = await generatePostData();

    let response = await axios({method: 'put', url: `${baseUrl}/post/${post.id}`, data: { content: newPostContent }});
    let { payload, message } = response.data;
    let retrievedPost: post = payload.post;

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Post updated successfully!')
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.category_id).toBe(post.category_id);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.content).not.toBe(post.content);
    expect(retrievedPost.content).toBe(newPostContent);

    response = await axios({method: 'get', url: `${baseUrl}/post/${post.id}`});
    payload = response.data.payload;
    message = response.data.message;
    retrievedPost = payload.post;

    retrievedPost.created_at = new Date(retrievedPost.created_at);
    retrievedPost.edited_at = retrievedPost.edited_at != null ? new Date(retrievedPost.edited_at) : null;
    retrievedPost.deleted_at = retrievedPost.deleted_at != null ? new Date(retrievedPost.deleted_at) : null;

    expect(response.status).toBe(200);
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.category_id).toBe(post.category_id);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.content).not.toBe(post.content);
    expect(retrievedPost.content).toBe(newPostContent);
    expect(retrievedPost.created_at).toBeInstanceOf(Date);
    expect(retrievedPost.edited_at).toBeInstanceOf(Date);
    expect(retrievedPost.deleted_at).toBeNull();
});

test('PostController handled a DELETE request.', async () => {
    const post = await generatePost();

    let response = await axios({method: 'delete', url: `${baseUrl}/post/${post.id}`});
    let { payload, message } = response.data;
    let retrievedPost: post = payload.post;

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Post deleted successfully!');
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.category_id).toBe(post.category_id);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.content).toBe(post.content);

    response = await axios({method: 'get', url: `${baseUrl}/post/${post.id}`});
    payload = response.data.payload;
    message = response.data.message;
    retrievedPost = payload.post;

    retrievedPost.created_at = new Date(retrievedPost.created_at);
    retrievedPost.edited_at = retrievedPost.edited_at != null ? new Date(retrievedPost.edited_at) : null;
    retrievedPost.deleted_at = retrievedPost.deleted_at != null ? new Date(retrievedPost.deleted_at) : null;

    expect(response.status).toBe(200);
    expect(retrievedPost.id).toBe(post.id);
    expect(retrievedPost.title).toBe(post.title);
    expect(retrievedPost.category_id).toBe(post.category_id);
    expect(retrievedPost.user_id).toBe(post.user_id);
    expect(retrievedPost.content).toBe(post.content);
    expect(retrievedPost.created_at).toBeInstanceOf(Date);
    expect(retrievedPost.edited_at).toBeNull();
    expect(retrievedPost.deleted_at).toBeInstanceOf(Date);
});

test('PostController threw an exception handling a DELETE request with non-existant ID.', async () => {
    let throwError = null;
    const postId = 999;

    await axios({method: 'delete', url: `${baseUrl}/post/${postId}`})
        .catch((error) => {
            throwError = error;
            const { name, message } = error.response.data;

            expect(error.response.status).toBe(400);
            expect(name).toBe('PostException');
            expect(message).toBe(`Cannot delete Post: Post does not exist with ID ${postId}.`);
        });

    expect(throwError).not.toBeNull();
});

afterAll(async () => {
    await truncateDatabase();
});