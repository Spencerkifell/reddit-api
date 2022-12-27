import axios from "axios";
import TestHelper from "../../TestHelper";
import { user } from "@prisma/client";
import { baseUrl } from "../../../globals"

const { generateUser, generateUserData, truncateDatabase } = TestHelper;

beforeAll(async () => {
  await truncateDatabase();
});

test('UserController handled a POST request.', async () => {
    const userData = generateUserData();
    await axios({method: 'post', url: `${baseUrl}/user`, data: userData})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(payload.user).toEqual(expect.objectContaining(userData));
            expect(message).toBe('User created successfully!');
        })
        .catch((error) => {
            expect(true).toBe(false)
        });
});

test('UserController threw an exception handling a POST request with blank username.', async () => {
    let throwError = null;

    const userData = generateUserData(" ");
    await axios({method: 'post', url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe('Cannot create User: Missing username.');
        });
    
    expect(throwError).not.toBeNull();
});

test('UserController threw an exception handling a POST request with blank email.', async () => {
    let throwError = null;
    const userData = generateUserData(null, "");

    await axios({method: 'post', url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe('Cannot create User: Missing email.');
        });

    expect(throwError).not.toBeNull();
});

test('UserController threw an exception handling a POST request with blank password.', async () => {
    let throwError = null;
	const userData = generateUserData(null, null, '');

    await axios({method: 'post', url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe('Cannot create User: Missing password.');
        });

    expect(throwError).not.toBeNull();
});

test('UserController threw an exception handling a POST request with duplicate username.', async () => {
    let throwError = null;
	const user = await generateUser();
	const userData = generateUserData(user.username);

    await axios({method: 'post', url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe('Cannot create User: Duplicate username.');
        });

    expect(throwError).not.toBeNull();
});

test('UserController threw an exception handling a POST request with duplicate email.', async () => {
    let throwError = null;
	const user = await generateUser();
	const userData = generateUserData(null, user.email);

    await axios({method: 'post', url: `${baseUrl}/user`, data: userData})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(throwError.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe('Cannot create User: Duplicate email.');
        });

    expect(throwError).not.toBeNull();
});

test('UserController handled a GET (all) request with no users in database.', async () => {
    await axios({method: 'get', url: `${baseUrl}/user`})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(message).toBe('Users retrieved successfully!');
            expect(Array.isArray(payload.users));
            expect(payload.users.length).toBe(0);
        })
        .catch((error) => {
            expect(true).toBe(false)
        });
});

test('UserController handled a GET (all) request with 3 users in database.', async () => {
    const users: user[] = new Array();

    for (let i = 0; i < 3; i++)
        users[i] = await generateUser();

    await axios({method: 'get', url: `${baseUrl}/user`})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(message).toBe('Users retrieved successfully!');
            expect(Array.isArray(payload.users));
            expect(payload.users.length).toBe(3);
            for(let i = 0; i < 3; i++){
                // Make sure that since the date object gets turned into a string within the response, created a new date with the string.
                payload.users[i].created_at = new Date(payload.users[i].created_at);
                expect(payload.users[i]).toEqual(users[i]);
            }
        })
        .catch((error) => {
            expect(true).toBe(false)
        });
});

test('UserController handled a GET (one) request.', async () => {
    const user: user = await generateUser();

    await axios({method: 'get', url: `${baseUrl}/user/${user.id}`})
        .then((response) => {
            let { message, payload } = response.data;
            expect(response.status).toBe(200);
            expect(message).toBe('User retrieved successfully!');
            // Make sure that since the date object gets turned into a string within the response, created a new date with the string.
            payload.user.created_at = new Date(payload.user.created_at);
            expect(payload.user).toEqual(user);
        })
        .catch((error) => {
            expect(true).toBe(false)
        });
});

test('UserController threw an exception handling a GET request with non-existant ID.', async () => {
    let throwError = null;
    const userId = 999;
    
    await axios({method: 'get', url: `${baseUrl}/user/${userId}`})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(error.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe(`Cannot retrieve User: User does not exist with ID ${userId}.`);
        });

    expect(throwError).not.toBeNull();
});

test('UserController handled a PUT request.', async () => {
    let user: user = await generateUser();
    const newUserData = generateUserData();

    // Creates a new user with the same id as the user we want to update with new data.
    let tmpUser = {...user, ...newUserData};

    await axios({method: "put", url: `${baseUrl}/user/${user.id}`, data: tmpUser})
        .then((response) => {
            let { message, payload } = response.data;

            let updatedUser: user = payload.user;
            updatedUser.created_at = new Date(updatedUser.created_at);

            expect(response.status).toBe(200);
            expect(response.data.message).toBe('User updated successfully!');
            expect(updatedUser.id).toBe(user.id);
            expect(updatedUser.username).toBe(newUserData.username);
            expect(updatedUser.username).not.toBe(user.username);
            expect(updatedUser.email).toBe(newUserData.email);
            expect(updatedUser.email).not.toBe(user.email);
            expect(updatedUser.created_at).toEqual(user.created_at);
        })
        .catch((error) => {
            expect(true).toBe(false)
        });

    await axios({method: "get", url: `${baseUrl}/user/${user.id}`})
        .then((response) => {
            let { message, payload } = response.data;

            let retrievedUser: user = payload.user;
            retrievedUser.created_at = new Date(retrievedUser.created_at);
            retrievedUser.edited_at = retrievedUser.edited_at != null ? new Date(retrievedUser.edited_at) : null;
            retrievedUser.deleted_at = retrievedUser.deleted_at != null ? new Date(retrievedUser.deleted_at) : null;

            expect(response.status).toBe(200);
            expect(retrievedUser.username).toBe(newUserData.username);
            expect(retrievedUser.email).toBe(newUserData.email);
            expect(retrievedUser.created_at).toBeInstanceOf(Date);
            expect(retrievedUser.edited_at).toBeInstanceOf(Date);
            expect(retrievedUser.deleted_at).toBeNull();
        })
        .catch((error) => {
            expect(true).toBe(false)
        });
});

test('UserController threw an exception handling a PUT request with non-existant ID.', async () => {
    let throwError = null;
    let userId = 999;
    let username = generateUserData().username;

    await axios({method: "put", url: `${baseUrl}/user/${userId}`, data: {username: username}})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(error.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe(`Cannot update User: User does not exist with ID ${userId}.`);
        });

    expect(throwError).not.toBeNull();
});

test('UserController threw an exception handling a PUT request with no update fields.', async () => {
	let throwError = null;
    const user = await generateUser();

    await axios({method: "put", url: `${baseUrl}/user/${user.id}`, data: {}})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(error.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe('Cannot update User: No update parameters were provided.');
        });

    expect(throwError).not.toBeNull();
});

test('UserController handled a DELETE request.', async () => {
    const user = await generateUser();

    await axios({method: "delete", url: `${baseUrl}/user/${user.id}`})
        .then((response) => {
            let { message, payload } = response.data;

            let deletedUser: user = payload.user;
            deletedUser.created_at = new Date(deletedUser.created_at);

            expect(response.status).toBe(200);
            expect(message).toBe('User deleted successfully!');
            expect(deletedUser.id).toBe(user.id);
            expect(deletedUser.username).toBe(user.username);
            expect(deletedUser.email).toBe(user.email);
        })
        .catch((error) => {
            expect(true).toBe(false)
        });

    await axios({method: "get", url: `${baseUrl}/user/${user.id}`})
        .then((response) => {
            let { payload } = response.data;

            let retrievedUser: user = payload.user;
            retrievedUser.created_at = new Date(retrievedUser.created_at);
            retrievedUser.edited_at = retrievedUser.edited_at != null ? new Date(retrievedUser.edited_at) : null;
            retrievedUser.deleted_at = retrievedUser.deleted_at != null ? new Date(retrievedUser.deleted_at) : null;

            expect(response.status).toBe(200);
            expect(retrievedUser.username).toBe(user.username);
            expect(retrievedUser.email).toBe(user.email);
            expect(retrievedUser.created_at).toBeInstanceOf(Date);
            expect(retrievedUser.edited_at).toBeNull();
            expect(retrievedUser.deleted_at).toBeInstanceOf(Date);
        })
        .catch((error) => {
            expect(true).toBe(false)
        });
});

test('UserController threw an exception handling a DELETE request with non-existant ID.', async () => {
    let throwError = null;
    let userId = 999;

    await axios({method: "delete", url: `${baseUrl}/user/${userId}`})
        .catch((error) => {
            throwError = error;
            let { message, name } = error.response.data;

            expect(error.response.status).toBe(400);
            expect(name).toBe('UserException');
            expect(message).toBe(`Cannot delete User: User does not exist with ID ${userId}.`);
        });

    expect(throwError).not.toBeNull();
});


afterEach(async () => {
    await truncateDatabase()
});