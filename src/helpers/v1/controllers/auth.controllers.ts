import { Request, Response } from "express";
import { UserRegister } from "../../../types/user";
import client from "../../../config/Client";
import UserServices from "../services/user.service";



export const handleUserRegistered = async (req: Request, res: Response) => {
    try {
        const data = req.body as UserRegister
        const userServices = new UserServices()
        const resp = userServices.authentications(data)
        return res.status(200).json(resp)
    } catch (error:any) {
        return res.status(500).json({error:error.message})
    }
}

export const TokenVerify = async (req: Request, res: Response) => {
    try {
        const user = (req as any)?.User
    
        const userServices = new UserServices()
        if (user === undefined) {
            return res.status(401).json({ message: 'UnAuthorized'})
        }
        const userData = await userServices.authResponse(user)
        return res.status(200).json({token:userData,user})
    } catch (error:any) {
        return res.status(500).json({error:error.message})
    }
 }