import faker from 'faker';
import CategoryRepository from "../../../repositories/CategoryRepository";
import TestHelper from "../../TestHelper"
import { user, category } from '@prisma/client'
import { prisma } from "../../../globals"

const { truncateDatabase, generateUser, generateCategoryData, generateCategory, generateCategories } = TestHelper;

// Define category repository.
let categoryRepository = new CategoryRepository();
let user: user;

beforeEach(async () => {
    await truncateDatabase();
    user = await generateUser();
})

test('Category was created successfully.', async () => {
    const { title, description } = await generateCategoryData();
    const category: category = await generateCategory(user, title, description);

    expect(category.title).toBe(title);
    expect(category.description).toBe(description);
    expect(category.user_id).toBe(user.id);
});

test('Category was not created with non-existant user.', async () => {
    const falseUser: user = user;
    falseUser.id += 1;

    await generateCategory(falseUser)
        .catch(error => {
            expect(error.name).toBe('CategoryException');
            expect(error.message).toBe(`Cannot create Category: User does not exist with ID ${falseUser.id}.`);
        });
});

test('Category was not created with blank title.', async () => {
    await categoryRepository.create({user_id: user.id, title: "", description: faker.lorem.sentence()})
        .catch((error) => {
            expect(error.name).toBe('CategoryException');
            expect(error.message).toBe('Cannot create Category: Missing title.');
        });
});

test('Category was not created with duplicate title.', async () => {
    const title = faker.lorem.word();

    await categoryRepository.create({user_id: user.id, title: title, description: faker.lorem.sentence()});

    await categoryRepository.create({user_id: user.id, title: title, description: faker.lorem.sentence()})
        .catch((error) => {
            expect(error.name).toBe('CategoryException');
            expect(error.message).toBe(`Cannot create Category: Duplicate title.`);           
        });
});

test('All categories found.', async () => {
    const categories = await generateCategories();
    const retrievedCategories = await categoryRepository.getAll();

    retrievedCategories.forEach((category: category, index: number) => {
        expect(Object.keys(category).includes('id')).toBe(true);
		expect(Object.keys(category).includes('title')).toBe(true);
		expect(Object.keys(category).includes('description')).toBe(true);
		expect(Object.keys(category).includes('user_id')).toBe(true);
		expect(category.id).toBe(categories[index].id);
		expect(category.title).toBe(categories[index].title);
		expect(category.description).toBe(categories[index].description);
		expect(category.user_id).toBe(categories[index].user_id);
		expect(category.created_at).not.toBeNull();
		expect(category.edited_at).toBeNull();
		expect(category.deleted_at).toBeNull();
    });
});

test('Category was found by ID.', async () => {
    const newCategory: category = await categoryRepository.create({
        user_id: user.id,
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
    });

    const retrievedCategory: category = await categoryRepository.findById(newCategory.id);

    expect(retrievedCategory.title).toMatch(newCategory.title);
    expect(retrievedCategory.created_at).toBeInstanceOf(Date);
    expect(retrievedCategory.edited_at).toBeNull();
    expect(retrievedCategory.deleted_at).toBeNull();
});

test('Category was not found by wrong ID.', async () => {
    const newCategory: category = await categoryRepository.create({
        user_id: user.id,
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
    });

    const retrievedCategory: category = await categoryRepository.findById(newCategory.id + 1);

    expect(retrievedCategory).toBeNull();
});

test('Category was found by title.', async () => {
    const newCategory: category = await categoryRepository.create({
        user_id: user.id,
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
    });

    const retrievedCategory: category = await categoryRepository.findByTitle(newCategory.title);

    expect(retrievedCategory.title).toMatch(newCategory.title);
});

test('Category was not found by wrong title.', async () => {
    const newCategory: category = await categoryRepository.create({
        user_id: user.id,
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
    });

    const retrievedCategory = await categoryRepository.findByTitle(`${newCategory.title}.wrong`);

    expect(retrievedCategory).toBeNull();
});

test('Category was updated successfully.', async () => {
    const title = faker.lorem.word();
    const category: category = await categoryRepository.create({
        user_id: user.id,
        title: title,
        description: faker.lorem.sentence(),
    });

    const newCategoryTitle = faker.lorem.word();

    category.title = newCategoryTitle;
    expect(category.edited_at).toBeNull();

    const wasUpdated = await categoryRepository.update(category.id, category);

    expect(wasUpdated != null).toBe(true);

    const retrievedCategory: category = await categoryRepository.findById(category.id);

    expect(retrievedCategory.title).toMatch(newCategoryTitle);
    expect(retrievedCategory.title).not.toMatch(title);
    expect(retrievedCategory.created_at).toBeInstanceOf(Date);
    expect(retrievedCategory.edited_at).toBeInstanceOf(Date);
    expect(retrievedCategory.deleted_at).toBeNull();
});

test('Category was not updated with blank title.', async () => {
    const category: category = await categoryRepository.create({
        user_id: user.id,
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
    });

    category.title = "";

    await categoryRepository.update(category.id, category)
        .catch((error) => {
            expect(error.name).toBe('CategoryException');
            expect(error.message).toBe('Cannot update Category: Missing title.');
        });
});

test('Category was deleted successfully.', async () => {
    const category: category = await categoryRepository.create({
        user_id: user.id,
        title: faker.lorem.word(),
        description: faker.lorem.sentence(),
    });

    expect(category.deleted_at).toBeNull();

    const wasDeleted = await categoryRepository.delete(category.id);

    expect(wasDeleted != null).toBe(true);

    const retrievedCategory: category = await categoryRepository.findById(category.id);

    expect(retrievedCategory.created_at).toBeInstanceOf(Date);
    expect(retrievedCategory.edited_at).toBeNull();
    expect(retrievedCategory.deleted_at).toBeInstanceOf(Date);
});

afterAll(async () => {
    await truncateDatabase()
});