import Repository from "../lib/Repository";
import UserRepository from "./UserRepository";
import CategoryException from "../exceptions/CategoryException";

import {category} from "@prisma/client";
import { prisma } from "../globals"

class CategoryRepository extends Repository {
  userRepository = new UserRepository();
  constructor() {
    super();
    this.setModel(prisma.category)
  }

  async create(data: any) {
    let { user_id, title, description } = data;

    if (!title && !description)
      throw new CategoryException("Cannot create Category: Missing required fields."); 
      
    if (await this.userRepository.findById(user_id) == null)
      throw new CategoryException(`Cannot create Category: User does not exist with ID ${user_id}.`);

    if (title?.trim().length == 0)
      throw new CategoryException("Cannot create Category: Missing title.");

    if (description?.trim().length == 0)
      throw new CategoryException("Cannot create Category: Missing description.");

    if (title && await this.findByTitle(title))
      throw new CategoryException("Cannot create Category: Duplicate title.");

    return await super.create(data);
  }

  async findByTitle(title: string) {
    try {
      return await this.model.findUnique({
        where: {
          title: title
        }
      });
    } catch (error) {
      throw new Error("Category not found.");
    } finally {
      await prisma.$disconnect();
    }
  }

  async update(id: number, data: any){
    let { title, description } = data;

    // Ensure that the category hasn't been deleted
    const category: category = await this.findById(id);

    // Validation when updating an existing category
    if (category == null)
      throw new CategoryException(`Cannot update Category: Category does not exist with ID ${id}.`);

    if (category?.deleted_at != null)
      throw new CategoryException(`Cannot update Category: Category has been deleted.`);

    if (title?.trim().length == 0)
      throw new CategoryException("Cannot update Category: Missing title.");

    if (description?.trim().length == 0)
      throw new CategoryException("Cannot update Category: Missing description.");

    if (category.title != title && await this.findByTitle(title) != null)
      throw new CategoryException("Cannot update Category: Duplicate title.");

    return await super.update(id, {title, description});
  }

  async delete(id: number){
    // Validation when deleting a category
    const category: category = await this.findById(id);

    if (!category)
      throw new CategoryException(`Cannot delete Category: Category does not exist with ID ${id}.`);

    if (category?.deleted_at != null)
      throw new CategoryException(`Cannot delete Category: Category has been deleted.`);

    return await super.delete(id);
  }
}

export default CategoryRepository;