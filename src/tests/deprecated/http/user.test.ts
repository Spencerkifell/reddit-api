import axios from 'axios';
import TestHelper from '../../TestHelper';

import { user } from "@prisma/client";
import { baseUrl } from "../../../globals";
const { generateUserData, generateUser, truncateDatabase } = TestHelper

beforeEach(async () => {
    await truncateDatabase();
});

test('Homepage was retrieved successfully.', async () => {
    let response = await axios({method: "get", url: `${baseUrl}`});

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(response.data.message).toBe('Welcome to the Reddit Clone API!');
    expect(response.data.payload).toMatchObject({});
});

test('Invalid path returned error.', async () => {
    let throwError = null;
    
    await axios({method: "get", url: `${baseUrl}/userr`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            expect(response.status).toBe(404);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(response.data.message).toBe('Invalid request path!');
            expect(response.data.payload).toMatchObject({});
        });
    
    expect(throwError).not.toBeNull();
});

test('Invalid request method returned error.', async () => {
    let throwError = null;
    
    await axios({method: "patch", url: `${baseUrl}/user`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            expect(response.status).toBe(405);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(response.data.message).toBe('Invalid request method!');
            expect(response.data.payload).toMatchObject({});
        });
    
    expect(throwError).not.toBeNull();
});

test('User created successfully.', async () => {
    const userData = generateUserData();
    let response = await axios({method: "post", url: `${baseUrl}/user`, data: userData});

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(response.data.message).toBe('User created successfully!');
    expect(Object.keys(response.data.payload).includes('user')).toBe(true);
    expect(Object.keys(response.data.payload.user).includes('id')).toBe(true);

    let user = response.data.payload.user as user;
    user.created_at = new Date(user.created_at);
    user.edited_at = user.edited_at != null ? new Date(user.edited_at) : null;
    user.deleted_at = user.deleted_at != null ? new Date(user.deleted_at) : null;

    expect(user).toMatchObject({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        created_at: expect.any(Date),
        edited_at: null,
        deleted_at: null
    });
});

test('User not created with blank username.', async () => {
    let throwError = null;
    const userData = generateUserData(" ");
    
    await axios({method: "post", url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create User: Missing username.');
            expect(payload).toMatchObject({});
        })
    
    expect(throwError).not.toBeNull();
});

test('User not created with blank email.', async () => {
    let throwError = null;
    const userData = generateUserData(null, " ");
    
    await axios({method: "post", url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create User: Missing email.');
            expect(payload).toMatchObject({});
        })
   
    expect(throwError).not.toBeNull();
});

test('User not created with blank password.', async () => {
    let throwError = null;
    const userData = generateUserData(null, null, " ");
    
    await axios({method: "post", url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create User: Missing password.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('User not created with duplicate username.', async () => {
    let throwError = null;
    const user: user = await generateUser();
    const userData = await generateUserData(user.username);

    await axios({method: "post", url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create User: Duplicate username.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});


test('User not created with duplicate email.', async () => {
    let throwError = null;
    const user: user = await generateUser();
    const userData = await generateUserData(null, user.email);

    await axios({method: "post", url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot create User: Duplicate email.');
            expect(payload).toMatchObject({});
        })
        
    expect(throwError).not.toBeNull();
});

test('All users found.', async () => {
    let users = [];
    const numberOfUsers = Math.floor(Math.random() * 10) + 1;

    for (let i = 0; i < numberOfUsers; i++)
        users.push(generateUser());

    users = await Promise.all(users);

    users.sort((userA, userB) => userA.id - userB.id);

    let response = await axios({method: "get", url: `${baseUrl}/user`});
    let { message, payload } = response.data;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('Users retrieved successfully!');
    expect(Array.isArray(payload.users)).toBe(true);
    expect(payload.users.length).toBe(numberOfUsers);

    payload.users.forEach((user: user, index: number) => {
        expect(Object.keys(user).includes('id')).toBe(true);
        expect(Object.keys(user).includes('username')).toBe(true);
        expect(Object.keys(user).includes('email')).toBe(true);
        expect(user.id).toBe(payload.users[index].id);
        expect(user.username).toBe(payload.users[index].username);
        expect(user.email).toBe(payload.users[index].email);
        expect(user.created_at).not.toBeNull();
        expect(user.edited_at).toBeNull();
        expect(user.deleted_at).toBeNull();
    });
});

test('User found by ID.', async () => {
    const user = await generateUser();

    let response = await axios({method: "get", url: `${baseUrl}/user/${user.id}`});
    let { message, payload } = response.data;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('User retrieved successfully!');
    expect(Object.keys(payload.user).includes('id')).toBe(true);
    expect(Object.keys(payload.user).includes('username')).toBe(true);
    expect(Object.keys(payload.user).includes('email')).toBe(true);
    expect(payload.user.id).toBe(user.id);
    expect(payload.user.username).toBe(user.username);
    expect(payload.user.email).toBe(user.email);
    expect(payload.user.created_at).not.toBeNull();
    expect(payload.user.edited_at).toBeNull();
    expect(payload.user.deleted_at).toBeNull();
});

test('User not found by wrong ID.', async () => {
    let throwError = null;
    const userId = Math.floor(Math.random() * 100) + 1;

    await axios({method: "get", url: `${baseUrl}/user/${userId}`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot retrieve User: User does not exist with ID ${userId}.`);
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('User updated successfully.', async () => {
    const user = await generateUser();
    const newUserData = generateUserData();

    let response = await axios({method: "put", url: `${baseUrl}/user/${user.id}`, data: newUserData});
    let message = response.data.message;
    let payload = response.data.payload;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('User updated successfully!');
    expect(Object.keys(payload.user).includes('id')).toBe(true);
    expect(Object.keys(payload.user).includes('username')).toBe(true);
    expect(Object.keys(payload.user).includes('email')).toBe(true);
    expect(payload.user.id).toBe(user.id);
    expect(payload.user.username).toBe(newUserData.username);
    expect(payload.user.email).toBe(newUserData.email);
    expect(payload.user.username).not.toBe(user.username);
    expect(payload.user.email).not.toBe(user.email);

    response = await axios({method: "get", url: `${baseUrl}/user/${user.id}`});
    message = response.data.message;
    payload = response.data.payload;

    expect(response.status).toBe(200);
    expect(payload.user.username).toBe(newUserData.username);
    expect(payload.user.email).toBe(newUserData.email);
    expect(payload.user.created_at).not.toBeNull();
    expect(payload.user.edited_at).not.toBeNull();
    expect(payload.user.deleted_at).toBeNull();
});

test('User not updated with non-existant ID.', async () => {
    let throwError = null;

    await axios({method: "put", url: `${baseUrl}/user/1`, data: { username: '' }})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot update User: User does not exist with ID 1.`);
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('User not updated with blank username.', async () => {
    let throwError = null;
    const user = await generateUser();

    await axios({method: "put", url: `${baseUrl}/user/${user.id}`, data: { username: '' }})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot update User: No update parameters were provided.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('User not updated with blank email.', async () => {
    let throwError = null;
    const user = await generateUser();

    await axios({method: "put", url: `${baseUrl}/user/${user.id}`, data: { email: '' }})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe('Cannot update User: No update parameters were provided.');
            expect(payload).toMatchObject({});
        })

    expect(throwError).not.toBeNull();
});

test('User deleted successfully.', async () => {
    const user = await generateUser();

    let response = await axios({method: "delete", url: `${baseUrl}/user/${user.id}`});
    let message = response.data.message;
    let payload = response.data.payload;

    expect(response.status).toBe(200);
    expect(Object.keys(response).includes('data')).toBe(true);
    expect(Object.keys(response.data).includes('message')).toBe(true);
    expect(Object.keys(response.data).includes('payload')).toBe(true);
    expect(message).toBe('User deleted successfully!');
    expect(Object.keys(payload.user).includes('id')).toBe(true);
    expect(Object.keys(payload.user).includes('username')).toBe(true);
    expect(Object.keys(payload.user).includes('email')).toBe(true);
    expect(payload.user.id).toBe(user.id);
    expect(payload.user.username).toBe(user.username);
    expect(payload.user.email).toBe(user.email);

    response = await axios({method: "get", url: `${baseUrl}/user/${user.id}`});
    message = response.data.message;
    payload = response.data.payload;

    expect(response.status).toBe(200);
    expect(payload.user.username).toBe(user.username);
    expect(payload.user.email).toBe(user.email);
    expect(payload.user.created_at).not.toBeNull();
    expect(payload.user.edited_at).toBeNull();
    expect(payload.user.deleted_at).not.toBeNull();
});

test('User not deleted with non-existant ID.', async () => {
    let throwError = null;
    await axios({method: "delete", url: `${baseUrl}/user/1`})
        .catch((error) => {
            throwError = error;
            let response = error.response;
            let { message, payload } = response.data;

            expect(response.status).toBe(400);
            expect(Object.keys(response).includes('data')).toBe(true);
            expect(Object.keys(response.data).includes('message')).toBe(true);
            expect(Object.keys(response.data).includes('payload')).toBe(true);
            expect(message).toBe(`Cannot delete User: User does not exist with ID 1.`);
            expect(payload).toMatchObject({});
        })
    expect(throwError).not.toBeNull();
});

afterAll(async () => {
    await truncateDatabase();
});