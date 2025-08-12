import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { BleManager } from 'react-native-ble-plx';

// Match the name with ESP32 code
const ESP32_DEVICE_NAME = "ESP32";
const BLE_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const BLE_CHAR_UUID    = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

export default function useBLE() {
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState([]);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const managerRef = useRef(null);

    useEffect(() => {
        managerRef.current = new BleManager();

        return () => {
            managerRef.current?.destroy();
        };
    }, []);

    const scanForDevices = async () => {
        try {
            setDevices([]);
            setIsScanning(true);
            
            // iOS requires specific scan options
            const scanOptions = {
                allowDuplicates: false,
                scanMode: Platform.OS === 'ios' ? 1 : 2,
            };
            
            // iOS sometimes needs specific service UUIDs
            const serviceUUIDs = Platform.OS === 'ios' ? [BLE_SERVICE_UUID] : null;
            
            managerRef.current.startDeviceScan(serviceUUIDs, scanOptions, (error, device) => {
                if (error) {
                    console.error("Scan error:", error);
                    setIsScanning(false);
                    return;
                }
                
                if (device) {
                    console.log("Found device:", device.name || device.id);
                    
                    // iOS sometimes doesn't get the name in the first scan
                    if ((device.name === ESP32_DEVICE_NAME || device.localName === ESP32_DEVICE_NAME) && 
                        !devices.some(d => d.id === device.id)) {
                        setDevices(prev => [...prev, device]);
                    }
                }
            });
            
            setTimeout(() => {
                if (managerRef.current) {
                    managerRef.current.stopDeviceScan();
                    setIsScanning(false);
                }
            }, 10000); // Scan longer for iOS
            
        } catch (e) {
            console.error("Scan error:", e);
            setIsScanning(false);
        }
    };

    const connectToDevice = async (deviceId) => {
        try {
            const device = await managerRef.current.connectToDevice(deviceId);
            setConnectedDevice(device);
            await device.discoverAllServicesAndCharacteristics();
            return device;
        } catch (e) {
            return null;
        }
    };

    const disconnectDevice = async () => {
        if (connectedDevice) {
            await managerRef.current.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
        }
    };

    // Write userId to ESP32 BLE characteristic
    const sendUserIdToBLE = async (device, userId) => {
        try {
            // For iOS compatibility, we may need to encode differently
            const encodedUserId = Platform.OS === 'ios'
                ? Buffer.from(userId).toString('base64')
                : Buffer.from(userId, "utf8").toString("base64");
                
            await device.writeCharacteristicWithResponseForService(
                BLE_SERVICE_UUID,
                BLE_CHAR_UUID,
                encodedUserId
            );
            return true;
        } catch (e) {
            console.error("Send error:", e);
            return false;
        }
    };

    return {
        isScanning,
        devices,
        connectedDevice,
        scanForDevices,
        connectToDevice,
        disconnectDevice,
        sendUserIdToBLE,
    };
}