
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

        socket.on('clear' , async () => {
            this.avaliableDevices.clear()
            this.socketToDeviceIp.clear()
        })


        socket.on('answer', (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);
            const fromIp = this.socketToDeviceIp.get(socket.id);

            if (targetDevice) {
                this.io.to(targetDevice.id).emit('answer', {
                    from: fromIp,
                    sdp: data.sdp
                });
            } else {
                console.log('❌ Target device not found for answer:', data.targetIp)
            }
        })

        socket.on('offer', async (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);
            const fromIp = await this.socketToDeviceIp.get(socket.id);
            if (!fromIp) return null
            const fromDevice = this.avaliableDevices.get(fromIp);
        
            if (targetDevice && fromIp) {
                this.io.to(targetDevice.id).emit('incoming-connection', {
                    fromIp: fromIp,
                    fromName: fromDevice?.deviceInfo?.name || 'Unknown Device'
                });
        
                this.io.to(targetDevice.id).emit('offer', {
                    from: fromIp,
                    sdp: data.sdp
                });
            } else {
                console.log('❌ Target device not found:', data.targetIp)
            }
        })

        socket.on('ice-candidate', (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);
            const fromIp = this.socketToDeviceIp.get(socket.id);
            
            if (targetDevice) {
                this.io.to(targetDevice.id).emit('ice-candidate', {
                    from: fromIp,
                    candidate: data.candidate
                });
            }
        });

        socket.on('webrtc-connected', (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);
            const fromIp = this.socketToDeviceIp.get(socket.id);
        
            if (targetDevice && fromIp) {
                this.io.to(targetDevice.id).emit('webrtc-connection-notify', {
                    fromIp: fromIp
                });
                const fromDevice = this.avaliableDevices.get(fromIp);
                const targetDeviceData = this.avaliableDevices.get(data.targetIp);
        
                if (fromDevice && targetDeviceData) {
                    if (!fromDevice.pairedDevices.includes(data.targetIp)) {
                        fromDevice.pairedDevices.push(data.targetIp);
                    }
                    if (!targetDeviceData.pairedDevices.includes(fromIp)) {
                        targetDeviceData.pairedDevices.push(fromIp);
                    }
                }
            }
        });
        
        socket.on('webrtc-disconnected', (data) => {
            const targetDevice = this.getSocketByDeviceIp(data.targetIp);
            const fromIp = this.socketToDeviceIp.get(socket.id);
        
            if (targetDevice && fromIp) {
                this.io.to(targetDevice.id).emit('webrtc-disconnection-notify', {
                    fromIp: fromIp
                });
                const fromDevice = this.avaliableDevices.get(fromIp);
                const targetDeviceData = this.avaliableDevices.get(data.targetIp);
        
                if (fromDevice) {
                    fromDevice.pairedDevices = fromDevice.pairedDevices.filter(ip => ip !== data.targetIp);
                }
                if (targetDeviceData) {
                    targetDeviceData.pairedDevices = targetDeviceData.pairedDevices.filter(ip => ip !== fromIp);
                }
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