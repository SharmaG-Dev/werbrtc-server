import { DeviceData } from "./device";



export interface UserRegister extends DeviceData {
    name: string
    email: string
}