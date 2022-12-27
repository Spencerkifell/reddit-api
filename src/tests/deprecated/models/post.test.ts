import faker from 'faker';
import PostRepository from "../../../repositories/PostRepository";
import TestHelper from "../../TestHelper";
import { user, category, post } from '@prisma/client'
import { prisma } from "../../../globals"

const { truncateDatabase, generatePosts, generatePost, generateCategory, generateCategoryData, generateUser, generateUserData } = TestHelper;

// Define repositories

let postRepository = new PostRepository();

let user: user;
let category: category;

beforeEach(async () => {
    await truncateDatabase();
    user = await generateUser();
    category = await generateCategory(user);
});

test('Post was created successfully.', async () => {
    const title = faker.lorem.sentence();
    const type = Math.random() < 0.5 ? 'Text' : 'URL'; // Randomly pick a text post or URL post.
    const content = faker.lorem.paragraph();

    const post: post = await generatePost(type, user, category, title, content);

    expect(post.title).toBe(title);
    expect(post.content).toBe(content);
    expect(post.user_id).toBe(user.id);
    expect(post.category_id).toBe(category.id);
});

test('Post was not created with non-existant user.', async () => {
    await postRepository.create({user_id: user.id + 1, category_id: category.id, title: faker.lorem.sentence(), type: Math.random() < 0.5 ? 'Text' : 'URL', content: faker.lorem.paragraph()})
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe(`Cannot create Post: User does not exist with ID ${user.id + 1}.`);
        });
});

test('Post was not created with non-existant category.', async () => {
    await postRepository.create({user_id: user.id, category_id: category.id + 1, title: faker.lorem.sentence(), type: Math.random() < 0.5 ? 'Text' : 'URL', content: faker.lorem.paragraph()})
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe(`Cannot create Post: Category does not exist with ID ${category.id + 1}.`);
        });
});

test('Post was not created with blank title.', async () => {
    const post = await postRepository.create({user_id: user.id, category_id: category.id, title: '', type: Math.random() < 0.5 ? 'Text' : 'URL', content: faker.lorem.paragraph()})
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe('Cannot create Post: Missing title.');
        });
});

test('Post was not created with blank type.', async () => {
    const post = await postRepository.create({user_id: user.id, category_id: category.id, title: faker.lorem.sentence(), type: '', content: faker.lorem.paragraph()})
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe('Cannot create Post: Missing type.');
        });
});

test('Post was not created with blank content.', async () => {
    const post = await postRepository.create({user_id: user.id, category_id: category.id, title: faker.lorem.sentence(), type: Math.random() < 0.5 ? 'Text' : 'URL', content: ''})
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe('Cannot create Post: Missing content.');
        });
});

test('Post was not created with duplicate title.', async () => {
    const title = faker.lorem.word();

    await postRepository.create({user_id: user.id, category_id: category.id, title: title, type: Math.random() < 0.5 ? 'Text' : 'URL', content: faker.lorem.paragraph()});

    const post = await postRepository.create({user_id: user.id, category_id: category.id, title: title, type: Math.random() < 0.5 ? 'Text' : 'URL', content: faker.lorem.paragraph()})
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe(`Cannot create Post: Duplicate title.`);
        });
});

test('Post was found by ID.', async () => {
    const newPost: post = await generatePost();

    const retrievedPost: post = await postRepository.findById(newPost.id);

    expect(retrievedPost.title).toMatch(newPost.title);
    expect(retrievedPost.created_at).toBeInstanceOf(Date);
    expect(retrievedPost.edited_at).toBeNull();
    expect(retrievedPost.deleted_at).toBeNull();
});

test('Post was not found by wrong ID.', async () => {
    const newPost = await postRepository.create({
        user_id: user.id,
        category_id: category.id,
        title: faker.lorem.sentence(),
        type: Math.random() < 0.5 ? 'Text' : 'URL',
        content: faker.lorem.paragraph()
    });

    const retrievedPost = await postRepository.findById(newPost.id + 1);

    expect(retrievedPost).toBeNull();
});

test('Post (Text) content was updated successfully.', async () => {
    const content = faker.lorem.paragraph();

    const post: post = await generatePost("Text");

    const newPostContent = faker.lorem.paragraph();

    post.content = newPostContent;
    expect(post.edited_at).toBeNull();

    const wasUpdated = await postRepository.update(post.id, post);

    expect(wasUpdated != null).toBe(true);

    const retrievedPost: post = await postRepository.findById(post.id);

    expect(retrievedPost.content).toMatch(newPostContent);
    expect(retrievedPost.content).not.toMatch(content);
    expect(retrievedPost.created_at).toBeInstanceOf(Date);
    expect(retrievedPost.edited_at).toBeInstanceOf(Date);
    expect(retrievedPost.deleted_at).toBeNull();
});

test('Post (Text) was not updated with blank content.', async () => {
    const post: post = await generatePost("Text");

    post.content = "";

    await postRepository.update(post.id, post)
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe('Cannot update Post: Missing content.');
        });
});

test('Post (URL) was not updated.', async () => {
    const post : post = await generatePost("URL");

    post.content = "";

    await postRepository.update(post.id, post)
        .catch((error) => {
            expect(error.name).toBe('PostException');
            expect(error.message).toBe('Cannot update Post: Only text posts are editable.');
        });
});

test('Post was deleted successfully.', async () => {
    const post : post = await generatePost();

    expect(post.deleted_at).toBeNull();

    const wasDeleted = await postRepository.delete(post.id);

    expect(wasDeleted != null).toBe(true);

    const retrievedPost: post = await postRepository.findById(post.id);

    expect(retrievedPost.created_at).toBeInstanceOf(Date);
    expect(retrievedPost.edited_at).toBeNull();
    expect(retrievedPost.deleted_at).toBeInstanceOf(Date);
});

afterAll(async () => {
    await truncateDatabase();
});