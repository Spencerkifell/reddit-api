import UserException from '../exceptions/UserException';
import Repository from "../lib/Repository";
import { prisma } from "../globals"
import { user } from "@prisma/client"
import { encryptPassword } from "../globals";

class UserRepository extends Repository {
    constructor() {
        super();
        this.setModel(prisma.user);
    }

    async create(data: any){
        // Validation when creating an account/user.
        let strTemplate = "Cannot create User:";

        let { username, email, password } = data;

        if (!username && !email && !password)
            throw new UserException(`${strTemplate} Missing required fields.`);

        if (!username || username?.trim().length == 0)
            throw new UserException(`${strTemplate} Missing username.`);

        if (!email || email?.trim().length == 0)
            throw new UserException(`${strTemplate} Missing email.`);

        if (!password || password?.trim().length == 0)
            throw new UserException(`${strTemplate} Missing password.`);

        if (await this.findByUserName(username))
            throw new UserException(`${strTemplate} Duplicate username.`);

        if (email && await this.findByEmail(email))
            throw new UserException(`${strTemplate} Duplicate email.`);

        data.password = encryptPassword(password);
        
        return await super.create(data);
    }

    async update(id: number, data: any){
        // Validation when updating an account/user.
        let { username, email, password, avatar } = data;
        let user: user = await this.findById(id);

        if (!user)
            throw new UserException(`Cannot update User: User does not exist with ID ${id}.`);

        if (!username && !email && !password && !avatar)
            throw new UserException('Cannot update User: No update parameters were provided.');

        if (email?.trim().length == 0)
            throw new UserException("Cannot update User: Missing email.");

        if (email && await this.findByEmail(email) != null && user.email != email)
            throw new UserException("Cannot update User: Duplicate email.");

        if (username?.trim().length == 0)
            throw new UserException("Cannot update User: Missing username.");

        if (username && await this.findByUserName(username) != null && user.username != username)
            throw new UserException("Cannot update User: Duplicate username.");

        if(password?.trim().length == 0)
            throw new UserException("Cannot update User: Missing password.");

        if(password)
            password = encryptPassword(password);

        return await super.update(id, { username, email, password, avatar });
    }

    async delete(id: number){
        // Validations when deleting an account/user.
        const user = await this.findById(id);

        if (!user)
            throw new UserException(`Cannot delete User: User does not exist with ID ${id}.`);

        if (user?.deleted_at != null)
            throw new UserException(`Cannot delete User: User has already been deleted.`);

        return await super.delete(id);
    }

    async findByEmail(email: string) {
        try {
            return await this.model.findUnique({
                where: {
                    email: email
                }
            })
        } catch (error) {
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    async findByUserName(username: string){
        try {
            return await this.model.findUnique({
                where: {
                    username: username
                }
            })
        } catch (error) {
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
}

export default UserRepository;