/**
 * PhoneRadar Shared Types
 * BLE protokolü için ortak tip tanımlamaları
 */

// BLE Service UUIDs
export const BLE_SERVICES = {
  // Standard Services
  BATTERY: "0000180f-0000-1000-8000-00805f9b34fb",
  DEVICE_INFO: "0000180a-0000-1000-8000-00805f9b34fb",

  // Custom Services
  RADAR_DATA: "12345678-1234-5678-1234-56789abcdef0",
  THERMAL_DATA: "12345678-1234-5678-1234-56789abcdef1",
  SENSOR_DATA: "12345678-1234-5678-1234-56789abcdef2",
} as const;

// BLE Characteristic UUIDs
export const BLE_CHARACTERISTICS = {
  // Battery
  BATTERY_LEVEL: "00002a19-0000-1000-8000-00805f9b34fb",

  // Device Info
  MANUFACTURER_NAME: "00002a29-0000-1000-8000-00805f9b34fb",
  MODEL_NUMBER: "00002a24-0000-1000-8000-00805f9b34fb",
  SERIAL_NUMBER: "00002a25-0000-1000-8000-00805f9b34fb",
  HARDWARE_REVISION: "00002a27-0000-1000-8000-00805f9b34fb",
  FIRMWARE_REVISION: "00002a26-0000-1000-8000-00805f9b34fb",

  // Radar
  RADAR_DISTANCE: "12345678-1234-5678-1234-56789abcdef3",
  RADAR_IMAGE: "12345678-1234-5678-1234-56789abcdef4",
  RADAR_CONFIG: "12345678-1234-5678-1234-56789abcdef8",

  // Thermal
  THERMAL_IMAGE: "12345678-1234-5678-1234-56789abcdef5",
  AMBIENT_TEMP: "12345678-1234-5678-1234-56789abcdef6",
  THERMAL_CONFIG: "12345678-1234-5678-1234-56789abcdef9",

  // Sensor
  SIGNAL_STRENGTH: "12345678-1234-5678-1234-56789abcdef7",
  TIMESTAMP: "12345678-1234-5678-1234-56789abcdefa",
  DEVICE_STATUS: "12345678-1234-5678-1234-56789abcdefb",
} as const;

// Device Info
export interface RadarDeviceInfo {
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  hardwareRevision?: string;
  firmwareRevision?: string;
}

// Sensor Data
export interface SensorData {
  batteryLevel: number; // 0-100 (%)
  temperature: number; // Celsius
  distance: number; // meters
  signalStrength: number; // dBm
  timestamp: number; // Unix timestamp
}

// Image Data
export interface RadarImageData {
  width: number;
  height: number;
  pixels: Uint8Array;
  timestamp: number;
}

export interface ThermalImageData {
  width: number;
  height: number;
  temperatures: Uint16Array; // Temperature * 100 (in Celsius)
  timestamp: number;
}

// Configuration
export interface RadarConfig {
  refreshRate: number; // Hz (1-30)
  maxRange: number; // meters (0.5-5.0)
}

export interface ThermalConfig {
  colorPalette: ThermalPalette;
  emissivity: number; // 1-100 (%)
}

export enum ThermalPalette {
  IRON = 0,
  RAINBOW = 1,
  WHITE_HOT = 2,
  BLACK_HOT = 3,
  ARCTIC = 4,
  LAVA = 5,
}

// Device Status
export interface DeviceStatus {
  radarActive: boolean;
  thermalActive: boolean;
  charging: boolean;
  error: boolean;
}

// Connection State
export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

// BLE Error
export interface BLEError {
  code: string;
  message: string;
}

// Constants
export const RADAR_DEFAULT_SIZE = {
  WIDTH: 32,
  HEIGHT: 24,
} as const;

export const THERMAL_DEFAULT_SIZE = {
  WIDTH: 32,
  HEIGHT: 24,
} as const;

export const DEFAULT_RADAR_CONFIG: RadarConfig = {
  refreshRate: 10,
  maxRange: 3,
};

export const DEFAULT_THERMAL_CONFIG: ThermalConfig = {
  colorPalette: ThermalPalette.IRON,
  emissivity: 95,
};

// Utility functions
export function parseDeviceStatus(byte: number): DeviceStatus {
  return {
    radarActive: (byte & 0b00000001) !== 0,
    thermalActive: (byte & 0b00000010) !== 0,
    charging: (byte & 0b00000100) !== 0,
    error: (byte & 0b00001000) !== 0,
  };
}

export function encodeDeviceStatus(status: DeviceStatus): number {
  let byte = 0;
  if (status.radarActive) byte |= 0b00000001;
  if (status.thermalActive) byte |= 0b00000010;
  if (status.charging) byte |= 0b00000100;
  if (status.error) byte |= 0b00001000;
  return byte;
}

export function parseRadarConfig(data: Uint8Array): RadarConfig {
  return {
    refreshRate: data[0],
    maxRange: data[1],
  };
}

export function encodeRadarConfig(config: RadarConfig): Uint8Array {
  return new Uint8Array([config.refreshRate, config.maxRange]);
}

export function parseThermalConfig(data: Uint8Array): ThermalConfig {
  return {
    colorPalette: data[0] as ThermalPalette,
    emissivity: data[1],
  };
}

export function encodeThermalConfig(config: ThermalConfig): Uint8Array {
  return new Uint8Array([config.colorPalette, config.emissivity]);
}
