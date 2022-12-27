import { PrismaClient } from '@prisma/client';
import { prisma } from '../globals';

class Repository {
    model: any;

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.delete = this.delete.bind(this);
        this.findById = this.findById.bind(this);
        this.update = this.update.bind(this);
    }

    setModel(model: any){
        this.model = model;
    }

    async getAll() {
        try {
            return await this.model.findMany();
        } catch (error) {
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    async create(data: any) {
        try{
            return await this.model.create({data: {...data}});
        } catch (error) {
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    async delete(id: number){
        try{
            return await this.model.update({
                where: {
                    id: id
                },
                data: {
                    deleted_at: new Date()
                }
            })
        } catch (error) {
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    async findById(id: number){
        try{
            return await this.model.findUnique({
                where: {
                    id: id
                }
            });
        } catch (error) {
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }

    async update(id: number, data: any){
        try{
            return await this.model.update({
                where: {
                    id: id
                },
                data: {
                    ...data,
                    edited_at: new Date()
                }
            })
        } catch (error) {
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
}

export default Repository;