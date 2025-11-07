
export interface RegisterDevice {
    name: string
    deviceType: 'Mobile' | 'Web' | 'PC',
    deviceIp: string
    deviceModel?: string
}

interface DeviceData {
    deviceInfo: RegisterDevice;
    pairedDevices: string[];
    active: boolean;
}
