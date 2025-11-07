

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv'
import SocketService from './services/socketService'
config()
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: {} })
const PORT: number = (process.env.PORT || 7000) as number

app.use(express.json())
const socket = new SocketService(io)
socket.initialize()

httpServer.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`)
})