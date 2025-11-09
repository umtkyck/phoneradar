"use client";

import { useState, useEffect, useRef } from "react";
import { Bluetooth, BluetoothOff, Battery, Thermometer, Radio, AlertCircle } from "lucide-react";

interface DeviceStatus {
  connected: boolean;
  deviceName: string;
  batteryLevel: number;
  temperature: number;
  distance: number;
  signalStrength: number;
}

export default function FlirOneRadarCard() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [status, setStatus] = useState<DeviceStatus>({
    connected: false,
    deviceName: "",
    batteryLevel: 0,
    temperature: 0,
    distance: 0,
    signalStrength: 0,
  });
  const [error, setError] = useState<string>("");
  const [radarData, setRadarData] = useState<number[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Web Bluetooth API ile cihaza bağlan
  const connectToDevice = async () => {
    try {
      setError("");

      // Web Bluetooth API kontrolü
      if (!navigator.bluetooth) {
        setError("Web Bluetooth API desteklenmiyor. Lütfen destekleyen bir tarayıcı kullanın.");
        return;
      }

      // BLE cihazını ara
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ["battery_service"] },
          { namePrefix: "FLIR" },
          { namePrefix: "Radar" },
        ],
        optionalServices: [
          "battery_service",
          "device_information",
        ],
      });

      setDevice(device);

      // GATT sunucusuna bağlan
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("GATT sunucusuna bağlanılamadı");
      }

      setStatus((prev) => ({
        ...prev,
        connected: true,
        deviceName: device.name || "Bilinmeyen Cihaz",
      }));

      // Batarya servisini oku
      try {
        const batteryService = await server.getPrimaryService("battery_service");
        const batteryLevel = await batteryService.getCharacteristic("battery_level");
        const value = await batteryLevel.readValue();

        setStatus((prev) => ({
          ...prev,
          batteryLevel: value.getUint8(0),
        }));

        // Batarya değişikliklerini dinle
        await batteryLevel.startNotifications();
        batteryLevel.addEventListener("characteristicvaluechanged", (event: any) => {
          const value = event.target.value.getUint8(0);
          setStatus((prev) => ({ ...prev, batteryLevel: value }));
        });
      } catch (err) {
        console.error("Batarya servisi okunamadı:", err);
      }

      // Simüle edilmiş radar verisi (gerçek cihazda custom service'den okunacak)
      startRadarSimulation();

    } catch (err: any) {
      setError(err.message || "Cihaza bağlanırken hata oluştu");
      console.error("Bluetooth hatası:", err);
    }
  };

  const disconnectDevice = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setStatus({
      connected: false,
      deviceName: "",
      batteryLevel: 0,
      temperature: 0,
      distance: 0,
      signalStrength: 0,
    });
  };

  // Radar verisi simülasyonu (demo için)
  const startRadarSimulation = () => {
    const interval = setInterval(() => {
      // 32x24 termal/radar görüntü matrisi
      const data: number[][] = [];
      for (let y = 0; y < 24; y++) {
        const row: number[] = [];
        for (let x = 0; x < 32; x++) {
          // Merkeze doğru daha sıcak/yakın
          const centerX = 16;
          const centerY = 12;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          const intensity = Math.max(0, 255 - distance * 15 + Math.random() * 30);
          row.push(intensity);
        }
        data.push(row);
      }
      setRadarData(data);

      // Rastgele sensör değerleri (demo)
      setStatus((prev) => ({
        ...prev,
        temperature: 20 + Math.random() * 10,
        distance: 0.5 + Math.random() * 2,
        signalStrength: -60 + Math.random() * 20,
      }));
    }, 100);

    return () => clearInterval(interval);
  };

  // Canvas'a radar verisini çiz
  useEffect(() => {
    if (!canvasRef.current || radarData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellWidth = canvas.width / radarData[0].length;
    const cellHeight = canvas.height / radarData.length;

    radarData.forEach((row, y) => {
      row.forEach((value, x) => {
        // Termal renk gradyanı (mavi -> yeşil -> sarı -> kırmızı)
        const hue = (1 - value / 255) * 240; // 240 (mavi) -> 0 (kırmızı)
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      });
    });
  }, [radarData]);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-xl font-bold text-white">FLIR One Radar</h2>
            {status.connected && (
              <p className="text-sm text-blue-100">{status.deviceName}</p>
            )}
          </div>
        </div>

        <button
          onClick={status.connected ? disconnectDevice : connectToDevice}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            status.connected
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-white hover:bg-gray-100 text-blue-600"
          }`}
        >
          {status.connected ? (
            <span className="flex items-center gap-2">
              <BluetoothOff className="w-4 h-4" />
              Bağlantıyı Kes
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Bluetooth className="w-4 h-4" />
              Bağlan
            </span>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 m-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="p-6">
        {/* Radar Display */}
        <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-[4/3]">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full"
            style={{ imageRendering: "pixelated" }}
          />
          {!status.connected && (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-center">
                <BluetoothOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Cihaz bağlı değil</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Batarya */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Batarya</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {status.batteryLevel}%
            </p>
          </div>

          {/* Sıcaklık */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400">Sıcaklık</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {status.temperature.toFixed(1)}°C
            </p>
          </div>

          {/* Mesafe */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Mesafe</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {status.distance.toFixed(2)}m
            </p>
          </div>

          {/* Sinyal */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bluetooth className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Sinyal</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {status.signalStrength.toFixed(0)} dBm
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>BLE Bağlantısı:</strong> Cihazınızı telefonunuza takın ve "Bağlan" butonuna tıklayın.
            Web Bluetooth API kullanarak gerçek zamanlı radar ve termal görüntü alabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
