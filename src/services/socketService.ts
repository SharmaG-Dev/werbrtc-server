
import { Server, Socket } from "socket.io";
import { DeviceData, RegisterDevice } from "../types/device";

class SocketService {
    private avaliableDevices = new Map<string, DeviceData>();
    private socketToDeviceIp = new Map<string, string>()
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    async initialize() {
        this.io.on('connection', (socket: Socket) => {
            console.log('connected', socket.id)
            this.handleOperations(socket);
        })
    }

    async handleOperations(socket: Socket) {
        socket.on('check-connected', (data: RegisterDevice) => {
            const userData = this.avaliableDevices.get(data.deviceIp)
            const connected = !!userData
            if (connected) {
                this.avaliableDevices.set(userData.deviceInfo.deviceIp, { ...userData, active: true })
            }
            socket.emit('check-connected', connected)
        })
        socket.on('connect-device', (data: RegisterDevice) => {
            const userData = this.avaliableDevices.get(data.deviceIp)
            if (userData) {
                this.avaliableDevices.set(data.deviceIp, { ...userData, active: true })
                this.socketToDeviceIp.set(socket.id, data.deviceIp)
                socket.emit('connect-device', { message: 'Ready To Pair' })
            } else {
                this.avaliableDevices.set(data.deviceIp, { deviceInfo: data, active: true, pairedDevices: [] })
                this.socketToDeviceIp.set(socket.id, data.deviceIp)
                socket.emit('connect-device', { message: "success registered No You can Ready To Pair" })
            }
        })
        socket.on('show-devices', async () => {
            const myDeviceIp = this.socketToDeviceIp.get(socket.id)
            const data = Array.from(this.avaliableDevices.values())
                .filter(device =>
                    device.active === true &&
                    device.deviceInfo.deviceIp !== myDeviceIp
                );

            socket.emit('show-devices', data)
        });


        socket.on('offer', (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);
            if (targetDevice) {
                this.io.to(targetDevice.id).emit('offer', {
                    from: this.socketToDeviceIp.get(socket.id),
                    sdp: data.sdp
                });
            }
        })

        socket.on('offer', (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);

            console.log('🔍 Looking for device IP:', data.targetIp) // Add this
            console.log('🔍 Found socket:', targetDevice?.id) // Add this

            if (targetDevice) {
                this.io.to(targetDevice.id).emit('offer', {
                    from: this.socketToDeviceIp.get(socket.id),
                    sdp: data.sdp
                });
                console.log('✅ Offer forwarded to', data.targetIp) // Add this
            } else {
                console.log('❌ Target device not found:', data.targetIp) // Add this
            }
        })

        socket.on('ice-candidate', (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);
            if (targetDevice) {
                this.io.to(targetDevice.id).emit('ice-candidate', {
                    from: this.socketToDeviceIp.get(socket.id),
                    candidate: data.candidate
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('disconnected', socket.id)
            const deviceIp = this.socketToDeviceIp.get(socket.id)
            if (!deviceIp) return null
            const deviceData = this.avaliableDevices.get(deviceIp)
            if (!deviceData) return null
            this.avaliableDevices.set(deviceIp, { ...deviceData, active: false })
            this.socketToDeviceIp.delete(socket.id)
        })
    }
    getSocketByDeviceIp(deviceIp: string) {
        for (let [socketId, ip] of this.socketToDeviceIp.entries()) {
            if (ip === deviceIp) {
                return this.io.sockets.sockets.get(socketId);
            }
        }
        return null;
    }

}

export default SocketService;