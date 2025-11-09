// BLE GATT Services ve Characteristics UUID'leri

export const BLE_SERVICES = {
  // Standart Servisler
  BATTERY: "battery_service" as BluetoothServiceUUID,
  DEVICE_INFO: "device_information" as BluetoothServiceUUID,

  // Custom Servisler (örnek UUID'ler - gerçek cihazda değişecek)
  RADAR_DATA: "12345678-1234-5678-1234-56789abcdef0" as BluetoothServiceUUID,
  THERMAL_DATA: "12345678-1234-5678-1234-56789abcdef1" as BluetoothServiceUUID,
  SENSOR_DATA: "12345678-1234-5678-1234-56789abcdef2" as BluetoothServiceUUID,
};

export const BLE_CHARACTERISTICS = {
  // Batarya
  BATTERY_LEVEL: "battery_level" as BluetoothCharacteristicUUID,

  // Cihaz Bilgisi
  MANUFACTURER_NAME: "manufacturer_name_string" as BluetoothCharacteristicUUID,
  MODEL_NUMBER: "model_number_string" as BluetoothCharacteristicUUID,
  FIRMWARE_VERSION: "firmware_revision_string" as BluetoothCharacteristicUUID,

  // Radar Verileri (custom)
  RADAR_DISTANCE: "12345678-1234-5678-1234-56789abcdef3" as BluetoothCharacteristicUUID,
  RADAR_IMAGE: "12345678-1234-5678-1234-56789abcdef4" as BluetoothCharacteristicUUID,

  // Termal Veriler (custom)
  THERMAL_IMAGE: "12345678-1234-5678-1234-56789abcdef5" as BluetoothCharacteristicUUID,
  AMBIENT_TEMP: "12345678-1234-5678-1234-56789abcdef6" as BluetoothCharacteristicUUID,

  // Sensör Verileri (custom)
  SIGNAL_STRENGTH: "12345678-1234-5678-1234-56789abcdef7" as BluetoothCharacteristicUUID,
};

export interface RadarDeviceInfo {
  name: string;
  manufacturer?: string;
  model?: string;
  firmware?: string;
}

export interface RadarSensorData {
  batteryLevel: number;
  temperature: number;
  distance: number;
  signalStrength: number;
  timestamp: number;
}

export interface RadarImageData {
  width: number;
  height: number;
  pixels: Uint8Array;
  timestamp: number;
}

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export interface BLEError {
  code: string;
  message: string;
}
