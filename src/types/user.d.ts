import { DeviceData, RegisterDevice } from "./device";



export interface UserRegister extends RegisterDevice {
    name: string
    email: string
}