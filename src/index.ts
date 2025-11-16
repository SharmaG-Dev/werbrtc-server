

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { config } from 'dotenv'
import SocketService from './services/socketService'
import V1Routes from './routes/v1/app'
import cors from 'cors'
import { User } from '@prisma/client'


declare global {
    namespace Express {
        interface Request {
            User?: User;
        }
    }
}
config()
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: {} })
const PORT: number = (process.env.PORT || 7000) as number
app.use(cors())
app.use(express.json())
const socket = new SocketService(io)
socket.initialize()


app.use('/api/v1' , V1Routes)

httpServer.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`)
})