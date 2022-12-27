import axios from 'axios';
import TestHelper from '../../TestHelper';

import { category } from "@prisma/client";
import { baseUrl } from "../../../globals";
const { generateCategoryData, generateCategory, truncateDatabase } = TestHelper

beforeEach(async () => {
    await truncateDatabase();
});

test('Category created successfully.', async () => {
    const categoryData = await generateCategoryData();
    const response = await axios({method: 'post', url: `${baseUrl}/category`, data: categoryData});
    const { payload, message } = response.data;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);

    expect(message).toBe('Category created successfully!');

    expect(Object.keys(payload).includes('category')).toBe(true);
    expect(Object.keys(payload.category).includes('id')).toBe(true);
    expect(Object.keys(payload.category).includes('title')).toBe(true);
    expect(Object.keys(payload.category).includes('description')).toBe(true);
    expect(Object.keys(payload.category).includes('user_id')).toBe(true);
    expect(Object.keys(payload.category).includes('created_at')).toBe(true);
    expect(Object.keys(payload.category).includes('edited_at')).toBe(true);
    expect(Object.keys(payload.category).includes('deleted_at')).toBe(true);

    expect(payload.category.title).toBe(categoryData.title);
    expect(payload.category.description).toBe(categoryData.description);
    expect(payload.category.user_id).toBe(categoryData.user_id);
    expect(payload.category.created_at).not.toBeNull();
    expect(payload.category.edited_at).toBeNull();
    expect(payload.category.deleted_at).toBeNull();
});

test('Category not created with non-existant user.', async () => {
    let throwError = null;
    const categoryData = await generateCategoryData();
    categoryData.user_id = 999;

    await axios({method: 'post', url: `${baseUrl}/category`, data: categoryData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe(`Cannot create Category: User does not exist with ID ${categoryData.user_id}.`);
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('Category not created with blank title.', async () => {
    let throwError = null;
    const categoryData = await generateCategoryData();
    categoryData.title = '';

    await axios ({method: 'post', url: `${baseUrl}/category`, data: categoryData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe(`Cannot create Category: Missing title.`);
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('Category not created with duplicate title.', async () => {
    let throwError = null;
    const category = await generateCategory();
    const categoryData = await generateCategoryData();

    categoryData.title = category.title;

    await axios({method: 'post', url: `${baseUrl}/category`, data: categoryData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe('Cannot create Category: Duplicate title.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('All categories found.', async () => {
    let categories = [];
    const numberOfCategories = Math.floor(Math.random() * 10) + 1;

    for (let i = 0; i < numberOfCategories; i++)
        categories.push(generateCategory());

    categories = await Promise.all(categories);

    categories.sort((categoryA, categoryB) => categoryA.id - categoryB.id);

    let response = await axios({method: 'get', url:`${baseUrl}/category`});
    let { payload, message } = response.data;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(message).toBe('Categories retrieved successfully!');
    expect(Array.isArray(payload.categories)).toBe(true);
    expect(payload.categories.length).toBe(numberOfCategories);

    payload.categories.forEach((category: category, index: number) => {
        expect(Object.keys(category).includes('id')).toBe(true);
        expect(Object.keys(category).includes('title')).toBe(true);
        expect(Object.keys(category).includes('user_id')).toBe(true);
        expect(Object.keys(category).includes('description')).toBe(true);
        expect(category.id).toBe(payload.categories[index].id);
        expect(category.title).toBe(payload.categories[index].title);
        expect(category.user_id).toBe(payload.categories[index].user_id);
        expect(category.description).toBe(payload.categories[index].description);
        expect(category.created_at).not.toBeNull();
        expect(category.edited_at).toBeNull();
        expect(category.deleted_at).toBeNull();
    });
});

test('Category found by ID.', async () => {
    const category = await generateCategory();

    let response = await axios({method: 'get', url:`${baseUrl}/category/${category.id}`});
    let { payload, message } = response.data;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(message).toBe('Category retrieved successfully!');
    expect(Object.keys(payload.category).includes('id')).toBe(true);
    expect(Object.keys(payload.category).includes('title')).toBe(true);
    expect(Object.keys(payload.category).includes('description')).toBe(true);
    expect(Object.keys(payload.category).includes('user_id')).toBe(true);
    expect(payload.category.id).toBe(category.id);
    expect(payload.category.title).toBe(category.title);
    expect(payload.category.description).toBe(category.description);
    expect(payload.category.user_id).toBe(category.user_id);
    expect(payload.category.created_at).not.toBeNull();
    expect(payload.category.edited_at).toBeNull();
    expect(payload.category.deleted_at).toBeNull();
});

test('Category not found by wrong ID.', async () => {
    let throwError = null;
    const categoryId = Math.floor(Math.random() * 100) + 1;

    await axios({method: 'get', url:`${baseUrl}/category/${categoryId}`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe(`Cannot retrieve Category: Category does not exist with ID ${categoryId}.`);
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('Category updated successfully.', async () => {
    const category = await generateCategory();
    const newCategoryData = await generateCategoryData();

    let response = await axios({method: 'put', url:`${baseUrl}/category/${category.id}`, data: {...newCategoryData, user_id: category.user_id}});
    let payload = response.data.payload;
    let message = response.data.message;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(message).toBe('Category updated successfully!');
    expect(Object.keys(payload.category).includes('id')).toBe(true);
    expect(Object.keys(payload.category).includes('title')).toBe(true);
    expect(Object.keys(payload.category).includes('description')).toBe(true);
    expect(payload.category.id).toBe(category.id);
    expect(payload.category.title).toBe(newCategoryData.title);
    expect(payload.category.description).toBe(newCategoryData.description);
    expect(payload.category.user_id).toBe(category.user_id);
    expect(payload.category.title).not.toBe(category.title);
    expect(payload.category.description).not.toBe(category.description);

    response = await axios({method: 'get', url:`${baseUrl}/category/${category.id}`});
    payload = response.data.payload;
    message = response.data.message;

    expect(response.status).toBe(200);
    expect(payload.category.title).toBe(newCategoryData.title);
    expect(payload.category.description).toBe(newCategoryData.description);
    expect(payload.category.created_at).not.toBeNull();
    expect(payload.category.edited_at).not.toBeNull();
    expect(payload.category.deleted_at).toBeNull();
});

test('Category not updated with non-existant ID.', async () => {
    let throwError = null;

    await axios({method: 'put', url: `${baseUrl}/category/1`, data: { title: 'Pokemon' }})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe(`Cannot update Category: Category does not exist with ID 1.`);
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('Category not updated with blank title.', async () => {
    let throwError = null;
    const category = await generateCategory();

    await axios({method: 'put', url: `${baseUrl}/category/${category.id}`, data: { title: '' }})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe('Cannot update Category: Missing title.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('Category not updated with blank description.', async () => {
    let throwError = null;
    const category: category = await generateCategory();

    await axios({method: 'put', url: `${baseUrl}/category/${category.id}`, data: { description: '' }})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe('Cannot update Category: Missing description.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('Category deleted successfully.', async () => {
    const category = await generateCategory();
    let response = await axios({method: 'delete', url: `${baseUrl}/category/${category.id}`});
    let { payload, message } = response.data;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(message).toBe('Category deleted successfully!');
    expect(Object.keys(payload).includes('category')).toBe(true);
    expect(Object.keys(payload.category).includes('id')).toBe(true);
    expect(Object.keys(payload.category).includes('title')).toBe(true);
    expect(Object.keys(payload.category).includes('description')).toBe(true);
    expect(payload.category.id).toBe(category.id);
    expect(payload.category.title).toBe(category.title);
    expect(payload.category.description).toBe(category.description);

    response = await axios({method: 'get', url:`${baseUrl}/category/${category.id}`});
    payload = response.data.payload;
    message = response.data.message;

    expect(response.status).toBe(200);
    expect(payload.category.title).toBe(category.title);
    expect(payload.category.description).toBe(category.description);
    expect(payload.category.created_at).not.toBeNull();
    expect(payload.category.edited_at).toBeNull();
    expect(payload.category.deleted_at).not.toBeNull();
});

test('Category not deleted with non-existant ID.', async () => {
    let throwError = null;

    await axios({method: 'delete', url: `${baseUrl}/category/1`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { payload, message } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(message).toBe('Cannot delete Category: Category does not exist with ID 1.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

afterAll(async () => {
    await truncateDatabase();
});