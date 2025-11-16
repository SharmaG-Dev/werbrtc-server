"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const Client_1 = __importDefault(require("../../../config/Client"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserServices {
    constructor() {
        this.prisma = Client_1.default;
    }
    authentications(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const findUser = yield this.prisma.user.findFirst({ where: { device: { deviceIp: data.deviceInfo.deviceIp } } });
            if (findUser)
                return this.authResponse(findUser);
            const newUser = yield this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    device: {
                        create: {
                            deviceIp: data.deviceInfo.deviceIp,
                            name: data.deviceInfo.name,
                            deviceType: data.deviceInfo.deviceType,
                            deviceModel: data.deviceInfo.deviceModel
                        }
                    }
                }
            });
            return this.authResponse(newUser);
        });
    }
    authResponse(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = {
                name: data.name,
                email: data.email
            };
            const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: '7h' });
            return token;
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.findUnique({ where: { id } });
        });
    }
    getUser(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.findFirst({ where: query, include: { device: true } });
        });
    }
    listUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.findMany();
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.password) {
                data.password = crypto_1.default.createHash('sha256').update(data.password).digest('hex');
            }
            return this.prisma.user.update({ where: { id }, data });
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.user.delete({ where: { id } });
        });
    }
}
exports.default = UserServices;
