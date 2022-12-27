import axios from "axios";;
import TestHelper from "../../TestHelper";
import { user, category } from "@prisma/client";
import { baseUrl } from "../../../globals"

const { generateUser, generateUserData, generateCategory, generateCategoryData, truncateDatabase } = TestHelper;

let newUserData: any;
let newUser: user;

beforeEach(async () => {
    await truncateDatabase();
    newUserData = generateUserData();
    newUser = await generateUser(newUserData.username, newUserData.email, newUserData.password);
});

test.only('CategoryController handled a POST request.', async () => {
    // Authenticate as the new user to create a new category
    let response = await axios({method: "post", url: `${baseUrl}/auth/login`, data: {username: newUserData.username, password: newUserData.password}});

    const categoryData = await generateCategoryData(newUser);
    await axios({method: "post", url: `${baseUrl}/category`, data: categoryData})
        .then((response) => {
            let { message, payload } = response.data;
            let category: category = payload.category;

            expect(response.status).toBe(200);
            expect(category.title).toBe(categoryData.title);
            expect(category.description).toBe(categoryData.description);
            expect(category.user_id).toBe(newUser.id);
        })
        .catch((error) => {
            expect(true).toBe(false);
        });
});

test('CategoryController handled a GET (all) request with no categories in database.', async () => {
    await axios({method: 'get', url: `${baseUrl}/category`})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(message).toBe("Categories retrieved successfully!");
            expect(Array.isArray(payload.categories));
            expect(payload.categories).toHaveLength(0);
        })
        .catch((error) => {
            expect(true).toBe(false);
        });
});

test('CategoryController handled a GET (all) request with 3 categories in database.', async () => {
    const categories: category[] = new Array();

    for (let i = 0; i < 3; i++)
        categories[i] = await generateCategory();

    await axios({method: 'get', url: `${baseUrl}/category`})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(message).toBe("Categories retrieved successfully!");
            expect(Array.isArray(payload.categories));
            expect(payload.categories).toHaveLength(3);
            for(let i = 0; i < 3; i++){
                payload.categories[i].created_at = new Date(payload.categories[i].created_at);
                expect(payload.categories[i].title).toBe(categories[i].title);
                expect(payload.categories[i].description).toBe(categories[i].description);
                expect(payload.categories[i].created_at).toEqual(categories[i].created_at);
            }
        })
        .catch((error) => {
            expect(true).toBe(false);
        });
});

test('CategoryController handled a GET (one) request.', async () => {
    const category: category = await generateCategory();

    await axios({method: 'get', url: `${baseUrl}/category/${category.id}`})
        .then((response) => {
            let { message, payload } = response.data;
            let retrievedCategory: category = payload.category;
            retrievedCategory.created_at = new Date(retrievedCategory.created_at);
            retrievedCategory.edited_at = retrievedCategory.edited_at ? new Date(retrievedCategory.edited_at) : null;
            retrievedCategory.deleted_at = retrievedCategory.deleted_at ? new Date(retrievedCategory.deleted_at) : null;

            expect(response.status).toBe(200);
            expect(message).toBe("Category retrieved successfully!");
            expect(retrievedCategory.title).toBe(category.title);
            expect(retrievedCategory.description).toBe(category.description);
            expect(retrievedCategory.created_at).toEqual(category.created_at);
            expect(retrievedCategory.edited_at).toEqual(category.edited_at);
            expect(retrievedCategory.deleted_at).toEqual(category.deleted_at);
        })
        .catch((error) => {
            expect(true).toBe(false);
        });
});

test('CategoryController threw an exception handling a GET request with non-existant ID.', async () => {
    let throwError = null;
    const categoryId = 999;

    await axios({method: 'get', url: `${baseUrl}/category/${categoryId}`})
        .catch((error) => {
            throwError = error;
            let { name, message } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe("CategoryException");
            expect(message).toBe(`Cannot retrieve Category: Category does not exist with ID ${categoryId}.`)
        });

    expect(throwError).not.toBeNull();
});

test('CategoryController handled a PUT request.', async () => {
    const category: category = await generateCategory();
    const {title: newCategoryTitle, description: newCategoryDescription} = await generateCategoryData();

    await axios({method: 'put', url: `${baseUrl}/category/${category.id}`, data: {title: newCategoryTitle, description: newCategoryDescription}})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(message).toBe("Category updated successfully!");
            expect(payload.category.id).toBe(category.id);
            expect(payload.category.title).toBe(newCategoryTitle);
            expect(payload.category.title).not.toBe(category.title);
            expect(payload.category.description).toBe(newCategoryDescription);
            expect(payload.category.description).not.toBe(category.description);
        })
        .catch((error) => {
            expect(true).toBe(false);
        });

    await axios({method: 'get', url: `${baseUrl}/category/${category.id}`})
        .then((response) => {
            let { message, payload } = response.data;
            let retrievedCategory: category = payload.category;
            retrievedCategory.created_at = new Date(retrievedCategory.created_at);
            retrievedCategory.edited_at = retrievedCategory.edited_at ? new Date(retrievedCategory.edited_at) : null;
            retrievedCategory.deleted_at = retrievedCategory.deleted_at ? new Date(retrievedCategory.deleted_at) : null;

            expect(response.status).toBe(200);
            expect(message).toBe("Category retrieved successfully!");

            expect(retrievedCategory.title).toBe(newCategoryTitle);
            expect(retrievedCategory.description).toBe(newCategoryDescription);
            expect(retrievedCategory.created_at).toBeInstanceOf(Date);
            expect(retrievedCategory.created_at).toEqual(category.created_at);
            expect(retrievedCategory.edited_at).toBeInstanceOf(Date);
            expect(retrievedCategory.edited_at).not.toEqual(category.edited_at);
            expect(retrievedCategory.deleted_at).toBeNull();
        });
});

test('CategoryController threw an exception handling a PUT request with non-existant ID.', async () => {
    let throwError = null;
    const categoryId = 999;
    const {title: newCategoryTitle, description: newCategoryDescription} = await generateCategoryData();

    await axios({method: 'put', url: `${baseUrl}/category/${categoryId}`, data: {title: newCategoryTitle, description: newCategoryDescription}})
        .catch((error) => {
            throwError = error;
            let { name, message } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe("CategoryException");
            expect(message).toBe(`Cannot update Category: Category does not exist with ID ${categoryId}.`)
        });

    expect(throwError).not.toBeNull();
});

test('CategoryController handled a DELETE request.', async () => {
    const category: category = await generateCategory();

    await axios({method: 'delete', url: `${baseUrl}/category/${category.id}`})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(message).toBe("Category deleted successfully!");
            expect(payload.category.id).toBe(category.id);
            expect(payload.category.title).toBe(category.title);
            expect(payload.category.description).toBe(category.description);
        })
        .catch((error) => {
            expect(true).toBe(false);
        });

    await axios({method: 'get', url: `${baseUrl}/category/${category.id}`})
        .then((response) => {
            let { message, payload } = response.data;
            let retrievedCategory: category = payload.category;
            retrievedCategory.created_at = new Date(retrievedCategory.created_at);
            retrievedCategory.edited_at = retrievedCategory.edited_at ? new Date(retrievedCategory.edited_at) : null;
            retrievedCategory.deleted_at = retrievedCategory.deleted_at ? new Date(retrievedCategory.deleted_at) : null;

            expect(response.status).toBe(200);
            expect(message).toBe("Category retrieved successfully!");
            expect(retrievedCategory.id).toBe(category.id);
            expect(retrievedCategory.title).toBe(category.title);
            expect(retrievedCategory.description).toBe(category.description);
            expect(retrievedCategory.created_at).toBeInstanceOf(Date);
            expect(retrievedCategory.created_at).toEqual(category.created_at);
            expect(retrievedCategory.edited_at).toBeNull();
            expect(retrievedCategory.deleted_at).toBeInstanceOf(Date);
        })
        .catch((error) => {
            expect(true).toBe(false);
        });
});

test('CategoryController threw an exception handling a DELETE request with non-existant ID.', async () => {
    let throwError = null;
    const categoryId = 999;

    await axios({method: 'delete', url: `${baseUrl}/category/${categoryId}`})
        .catch((error) => {
            throwError = error;
            let { name, message } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe("CategoryException");
            expect(message).toBe(`Cannot delete Category: Category does not exist with ID ${categoryId}.`)
        });

    expect(throwError).not.toBeNull();
});

afterAll(async () => {
    await truncateDatabase();
});