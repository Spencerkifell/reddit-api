import UserRepository from "../../../repositories/UserRepository";
import faker from 'faker';
import TestHelper from "../../TestHelper";
import { prisma, encryptPassword, comparePassword } from "../../../globals"
import { user } from '@prisma/client'

const { truncateDatabase, generateUser, generateUserData, generateUsers } = TestHelper;

const userRepository = new UserRepository();

beforeEach(async () => {
    await truncateDatabase();
})

test('User was created successfully.', async () => {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password()
    const newUser = await userRepository.create({username: username, email: email, password: password});

    expect(newUser.username).toBe(username);
    expect(newUser.email).toBe(email);
    expect(comparePassword(password, newUser.password)).toBe(true);
});

test('User was not created with blank username.', async () => {
    const username = '';
    const email = faker.internet.email();
    const password = faker.internet.password();

    await userRepository.create({username: username, email: email, password: password})
        .catch(error => {
            expect(error.name).toBe('UserException');
            expect(error.message).toBe('Cannot create User: Missing username.');
        });
});

test('User was not created with blank email.', async () => {
    const username = faker.internet.userName();
    const email = '';
    const password = faker.internet.password();

    await userRepository.create({username: username, email: email, password: password})
        .catch(error => {
            expect(error.name).toBe('UserException');
            expect(error.message).toBe('Cannot create User: Missing email.');
        });
});

test('User was not created with blank password.', async () => {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const password = '';

    await userRepository.create({username: username, email: email, password: password})
        .catch(error => {
            expect(error.name).toBe('UserException');
            expect(error.message).toBe('Cannot create User: Missing password.');
        });
});

test('User was not created with duplicate username.', async () => {
    const username = faker.internet.userName();

    await userRepository.create({username: username, email: faker.internet.email(), password: faker.internet.password(),});

    await userRepository.create({username: username, email: faker.internet.email(), password: faker.internet.password(),})
        .catch(error => {
            expect(error.name).toBe('UserException');
            expect(error.message).toBe('Cannot create User: Duplicate username.');
        });
});

test('User was not created with duplicate email.', async () => {
    const email = faker.internet.email();

    await userRepository.create({username: faker.internet.userName(), email: email, password: faker.internet.password(),});

    const user = await userRepository.create({username: faker.internet.userName(), email: email, password: faker.internet.password(),})
        .catch(error => {
            expect(error.name).toBe('UserException');
            expect(error.message).toBe('Cannot create User: Duplicate email.');
        });
});

test('All users found.', async () => {
    const users: user[] = await generateUsers();
    const retrievedUsers: user[] = await userRepository.getAll();

	retrievedUsers.forEach((user, index) => {
		expect(Object.keys(user).includes('id')).toBe(true);
		expect(Object.keys(user).includes('username')).toBe(true);
		expect(Object.keys(user).includes('email')).toBe(true);
		expect(user.id).toBe(users[index].id);
		expect(user.username).toBe(users[index].username);
		expect(user.email).toBe(users[index].email);
		expect(user.username).toMatch(users[index].username);
		expect(user.created_at).toBeInstanceOf(Date);
		expect(user.edited_at).toBeNull();
		expect(user.deleted_at).toBeNull();
	});
});

test('User was found by ID.', async () => {
    const newUser: user = await generateUser();
    const retrievedUser = await userRepository.findById(newUser.id);

    expect(retrievedUser.username).toMatch(newUser.username);
    expect(retrievedUser.created_at).toBeInstanceOf(Date);
    expect(retrievedUser.edited_at).toBeNull();
    expect(retrievedUser.deleted_at).toBeNull();
});

test('User was not found by wrong ID.', async () => {
    const newUser: user = await generateUser();
    const retrievedUser = await userRepository.findById(newUser.id + 1);

    expect(retrievedUser).toBeNull();
});

test('User was found by email.', async () => {
    const newUser: user = await generateUser();
    const retrievedUser = await userRepository.findByEmail(newUser.email);

    expect(retrievedUser.username).toMatch(newUser.username);
});

test('User was not found by wrong email.', async () => {
    const newUser: user = await generateUser();
    const retrievedUser = await userRepository.findByEmail(`${newUser.email}.wrong`);

    expect(retrievedUser).toBeNull();
});

test('User was updated successfully.', async () => {
    const { username } = generateUserData();
    const newUser: user = await generateUser();
    const newUsername = faker.internet.userName();

    newUser.username = newUsername;
    expect(newUser.edited_at).toBeNull();

    const wasUpdated = await userRepository.update(newUser.id, newUser);

    expect(wasUpdated != null).toBe(true);

    const retrievedUser = await userRepository.findById(newUser.id);

    expect(retrievedUser.username).toMatch(newUsername);
    expect(retrievedUser.username).not.toMatch(username);
    expect(retrievedUser.created_at).toBeInstanceOf(Date);
    expect(retrievedUser.edited_at).toBeInstanceOf(Date);
    expect(retrievedUser.deleted_at).toBeNull();
});

test('User avatar was updated successfully.', async () => {
    const newUser: user = await generateUser();
    const newAvatar = faker.image.image();

    newUser.avatar = newAvatar;
    expect(newUser.edited_at).toBeNull();

    const wasUpdated = await userRepository.update(newUser.id, newUser);

    expect(wasUpdated != null).toBe(true);

    const retrievedUser = await userRepository.findById(newUser.id);

    expect(retrievedUser.avatar).toMatch(newAvatar);
    expect(retrievedUser.created_at).toBeInstanceOf(Date);
    expect(retrievedUser.edited_at).toBeInstanceOf(Date);
    expect(retrievedUser.deleted_at).toBeNull();
});

test('User was not updated with blank username.', async () => {
    const user: user = await generateUser();

    user.username = '';

    await userRepository.update(user.id, user)
        .catch((error) => {
            expect(error.name).toBe('UserException');
            expect(error.message).toBe('Cannot update User: Missing username.');
        });
});

test('User was not updated with blank email.', async () => {
    const user: user = await generateUser();

    user.email = '';

    await userRepository.update(user.id, user)
        .catch((error) => {
            expect(error.name).toBe('UserException');
            expect(error.message).toBe('Cannot update User: Missing email.');
        });
});

test('User was deleted successfully.', async () => {
    const user: user = await generateUser();

    expect(user.deleted_at).toBeNull();

    const wasDeleted = await userRepository.delete(user.id);

    expect(wasDeleted != null).toBe(true);

    const retrievedUser = await userRepository.findById(user.id);

    expect(retrievedUser.created_at).toBeInstanceOf(Date);
    expect(retrievedUser.edited_at).toBeNull();
    expect(retrievedUser.deleted_at).toBeInstanceOf(Date);
});

afterAll(async () => {
    await truncateDatabase();
});