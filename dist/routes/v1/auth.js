"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controllers_1 = require("../../helpers/v1/controllers/auth.controllers");
const auth_m_1 = require("../../helpers/v1/middlewares/auth.m");
const router = express_1.default.Router();
router.route('/authenticate').post(auth_controllers_1.handleUserRegistered);
router.route('/verify').get(auth_m_1.Authentications, auth_controllers_1.TokenVerify);
exports.default = router;
