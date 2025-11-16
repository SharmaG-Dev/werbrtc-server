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
exports.TokenVerify = exports.handleUserRegistered = void 0;
const user_service_1 = __importDefault(require("../services/user.service"));
const handleUserRegistered = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const userServices = new user_service_1.default();
        const resp = userServices.authentications(data);
        return res.status(200).json(resp);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.handleUserRegistered = handleUserRegistered;
const TokenVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req === null || req === void 0 ? void 0 : req.User;
        const userServices = new user_service_1.default();
        if (user === undefined) {
            return res.status(401).json({ message: 'UnAuthorized' });
        }
        const userData = yield userServices.authResponse(user);
        return res.status(200).json({ token: userData, user });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.TokenVerify = TokenVerify;
