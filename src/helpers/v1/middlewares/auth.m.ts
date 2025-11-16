import { NextFunction, Request, Response } from "express";

import Jwt from 'jsonwebtoken'
import UserServices from "../services/user.service";
import { User } from "@prisma/client";



export const Authentications = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split('')[1]
    if (!token) {
        return res.status(401).json({ message: 'UnAuthorized' })
    }
    try {
        Jwt.verify(token, process.env.JWT_SECRET as string, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token Invalid or Expired' })
            }
            const { email } = decoded as { email: string, name: string }

            const userSevice = new UserServices()
            const userInfo = await userSevice.getUser({ email })
            req.User = userInfo as User;
            next()
        })

    } catch {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}