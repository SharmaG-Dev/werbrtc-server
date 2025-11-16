"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = require("dotenv");
const socketService_1 = __importDefault(require("./services/socketService"));
const app_1 = __importDefault(require("./routes/v1/app"));
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: {} });
const PORT = (process.env.PORT || 7000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const socket = new socketService_1.default(io);
socket.initialize();
app.use('/api/v1', app_1.default);
httpServer.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});
