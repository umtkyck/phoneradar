import {
  BLE_SERVICES,
  BLE_CHARACTERISTICS,
  RadarDeviceInfo,
  RadarSensorData,
  RadarImageData,
  ConnectionState,
  BLEError,
} from "@/types/bluetooth";

export class BLERadarService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  /**
   * Web Bluetooth API destekleniyorsa true döner
   */
  isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  /**
   * Radar cihazını arar ve bağlanır
   */
  async connect(): Promise<RadarDeviceInfo> {
    if (!this.isSupported()) {
      throw new Error("Web Bluetooth API bu tarayıcıda desteklenmiyor");
    }

    try {
      // Cihaz seç
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [BLE_SERVICES.BATTERY] },
          { namePrefix: "FLIR" },
          { namePrefix: "Radar" },
          { namePrefix: "PhoneRadar" },
        ],
        optionalServices: [
          BLE_SERVICES.BATTERY,
          BLE_SERVICES.DEVICE_INFO,
          BLE_SERVICES.RADAR_DATA,
          BLE_SERVICES.THERMAL_DATA,
          BLE_SERVICES.SENSOR_DATA,
        ],
      });

      // Disconnect eventini dinle
      this.device.addEventListener("gattserverdisconnected", this.onDisconnected.bind(this));

      // GATT sunucusuna bağlan
      this.server = await this.device.gatt!.connect();

      // Cihaz bilgilerini oku
      const deviceInfo = await this.getDeviceInfo();

      return deviceInfo;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cihaz bağlantısını keser
   */
  disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.listeners.clear();
  }

  /**
   * Bağlantı durumunu kontrol eder
   */
  isConnected(): boolean {
    return this.device?.gatt?.connected || false;
  }

  /**
   * Cihaz bilgilerini okur
   */
  private async getDeviceInfo(): Promise<RadarDeviceInfo> {
    const info: RadarDeviceInfo = {
      name: this.device?.name || "Bilinmeyen Cihaz",
    };

    try {
      if (!this.server) return info;

      const deviceInfoService = await this.server.getPrimaryService(BLE_SERVICES.DEVICE_INFO);

      // Üretici
      try {
        const manufacturerChar = await deviceInfoService.getCharacteristic(
          BLE_CHARACTERISTICS.MANUFACTURER_NAME
        );
        const value = await manufacturerChar.readValue();
        info.manufacturer = new TextDecoder().decode(value);
      } catch (e) {
        console.warn("Üretici bilgisi okunamadı");
      }

      // Model
      try {
        const modelChar = await deviceInfoService.getCharacteristic(
          BLE_CHARACTERISTICS.MODEL_NUMBER
        );
        const value = await modelChar.readValue();
        info.model = new TextDecoder().decode(value);
      } catch (e) {
        console.warn("Model bilgisi okunamadı");
      }

      // Firmware
      try {
        const firmwareChar = await deviceInfoService.getCharacteristic(
          BLE_CHARACTERISTICS.FIRMWARE_VERSION
        );
        const value = await firmwareChar.readValue();
        info.firmware = new TextDecoder().decode(value);
      } catch (e) {
        console.warn("Firmware bilgisi okunamadı");
      }
    } catch (error) {
      console.warn("Cihaz bilgileri okunamadı:", error);
    }

    return info;
  }

  /**
   * Batarya seviyesini okur ve değişiklikleri dinler
   */
  async subscribeToBattery(callback: (level: number) => void): Promise<void> {
    if (!this.server) throw new Error("Cihaz bağlı değil");

    try {
      const batteryService = await this.server.getPrimaryService(BLE_SERVICES.BATTERY);
      const batteryChar = await batteryService.getCharacteristic(
        BLE_CHARACTERISTICS.BATTERY_LEVEL
      );

      // İlk değeri oku
      const value = await batteryChar.readValue();
      callback(value.getUint8(0));

      // Bildirimleri başlat
      await batteryChar.startNotifications();
      batteryChar.addEventListener("characteristicvaluechanged", (event: any) => {
        const level = event.target.value.getUint8(0);
        callback(level);
      });

      this.addListener("battery", callback);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Radar görüntü verilerine abone ol
   */
  async subscribeToRadarImage(callback: (data: RadarImageData) => void): Promise<void> {
    if (!this.server) throw new Error("Cihaz bağlı değil");

    try {
      const radarService = await this.server.getPrimaryService(BLE_SERVICES.RADAR_DATA);
      const imageChar = await radarService.getCharacteristic(
        BLE_CHARACTERISTICS.RADAR_IMAGE
      );

      await imageChar.startNotifications();
      imageChar.addEventListener("characteristicvaluechanged", (event: any) => {
        const value: DataView = event.target.value;

        // Veri formatı: [width (2 bytes)][height (2 bytes)][pixels...]
        const width = value.getUint16(0, true);
        const height = value.getUint16(2, true);
        const pixels = new Uint8Array(value.buffer, 4);

        callback({
          width,
          height,
          pixels,
          timestamp: Date.now(),
        });
      });

      this.addListener("radarImage", callback);
    } catch (error) {
      console.warn("Radar görüntü servisi kullanılamıyor:", error);
    }
  }

  /**
   * Termal görüntü verilerine abone ol
   */
  async subscribeToThermalImage(callback: (data: RadarImageData) => void): Promise<void> {
    if (!this.server) throw new Error("Cihaz bağlı değil");

    try {
      const thermalService = await this.server.getPrimaryService(BLE_SERVICES.THERMAL_DATA);
      const imageChar = await thermalService.getCharacteristic(
        BLE_CHARACTERISTICS.THERMAL_IMAGE
      );

      await imageChar.startNotifications();
      imageChar.addEventListener("characteristicvaluechanged", (event: any) => {
        const value: DataView = event.target.value;

        const width = value.getUint16(0, true);
        const height = value.getUint16(2, true);
        const pixels = new Uint8Array(value.buffer, 4);

        callback({
          width,
          height,
          pixels,
          timestamp: Date.now(),
        });
      });

      this.addListener("thermalImage", callback);
    } catch (error) {
      console.warn("Termal görüntü servisi kullanılamıyor:", error);
    }
  }

  /**
   * Sensör verilerine abone ol
   */
  async subscribeToSensorData(callback: (data: Partial<RadarSensorData>) => void): Promise<void> {
    if (!this.server) throw new Error("Cihaz bağlı değil");

    try {
      const sensorService = await this.server.getPrimaryService(BLE_SERVICES.SENSOR_DATA);

      // Sıcaklık
      try {
        const tempChar = await sensorService.getCharacteristic(
          BLE_CHARACTERISTICS.AMBIENT_TEMP
        );
        await tempChar.startNotifications();
        tempChar.addEventListener("characteristicvaluechanged", (event: any) => {
          const temp = event.target.value.getFloat32(0, true);
          callback({ temperature: temp, timestamp: Date.now() });
        });
      } catch (e) {
        console.warn("Sıcaklık sensörü kullanılamıyor");
      }

      // Mesafe
      try {
        const distChar = await sensorService.getCharacteristic(
          BLE_CHARACTERISTICS.RADAR_DISTANCE
        );
        await distChar.startNotifications();
        distChar.addEventListener("characteristicvaluechanged", (event: any) => {
          const distance = event.target.value.getFloat32(0, true);
          callback({ distance, timestamp: Date.now() });
        });
      } catch (e) {
        console.warn("Mesafe sensörü kullanılamıyor");
      }

      // Sinyal gücü
      try {
        const signalChar = await sensorService.getCharacteristic(
          BLE_CHARACTERISTICS.SIGNAL_STRENGTH
        );
        await signalChar.startNotifications();
        signalChar.addEventListener("characteristicvaluechanged", (event: any) => {
          const signalStrength = event.target.value.getInt8(0);
          callback({ signalStrength, timestamp: Date.now() });
        });
      } catch (e) {
        console.warn("Sinyal gücü okunamıyor");
      }

      this.addListener("sensorData", callback);
    } catch (error) {
      console.warn("Sensör servisi kullanılamıyor:", error);
    }
  }

  /**
   * Listener ekle
   */
  private addListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Bağlantı kesildiğinde
   */
  private onDisconnected(): void {
    console.log("BLE cihaz bağlantısı kesildi");
    this.device = null;
    this.server = null;
  }

  /**
   * Hata işleme
   */
  private handleError(error: any): BLEError {
    let message = "Bilinmeyen hata";
    let code = "UNKNOWN_ERROR";

    if (error.name === "NotFoundError") {
      message = "Cihaz bulunamadı";
      code = "DEVICE_NOT_FOUND";
    } else if (error.name === "SecurityError") {
      message = "Güvenlik hatası: HTTPS bağlantısı gerekli";
      code = "SECURITY_ERROR";
    } else if (error.name === "NetworkError") {
      message = "Ağ hatası: Cihaza bağlanılamadı";
      code = "NETWORK_ERROR";
    } else if (error.name === "NotSupportedError") {
      message = "Web Bluetooth API desteklenmiyor";
      code = "NOT_SUPPORTED";
    } else if (error.message) {
      message = error.message;
    }

    return { code, message };
  }
}

// Singleton instance
export const bleRadarService = new BLERadarService();
