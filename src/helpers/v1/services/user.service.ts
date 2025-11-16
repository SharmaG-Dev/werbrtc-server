
import { PrismaClient, User } from '@prisma/client';
import crypto from 'crypto';
import client from '../../../config/Client';
import { UserRegister } from '../../../types/user';
import Jwt from 'jsonwebtoken'

class UserServices {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = client as PrismaClient
    }

    async authentications(data: UserRegister) {
        const findUser = await this.prisma.user.findFirst({ where: { device: { deviceIp: data.deviceIp } } })
        if (findUser) return this.authResponse(findUser)
        const newUser = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                device: {
                    create: {
                        deviceIp: data.deviceIp,
                        name: data.name,
                        deviceType: data.deviceType,
                        deviceModel: data.deviceModel
                    }
                }
            }
        })
        return this.authResponse(newUser)
    }

    async authResponse(data: User) {
        const payload = {
            name: data.name,
            email: data.email
        }
        const token = Jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7h' })
        return token
    }



    async getUserById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async getUser(query: { [key: string]: any }) {
        return this.prisma.user.findFirst({ where: query, include: { device: true } })
    }

    async listUsers() {
        return this.prisma.user.findMany();
    }

    async updateUser(id: string, data: Partial<{ name: string; email: string; password: string }>) {
        if (data.password) {
            data.password = crypto.createHash('sha256').update(data.password).digest('hex');
        }
        return this.prisma.user.update({ where: { id }, data });
    }

    async deleteUser(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }
}




export default UserServices