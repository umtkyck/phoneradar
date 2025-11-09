//
//  BLEManager.swift
//  PhoneRadar
//
//  Created on 2024-01-09.
//

import Foundation
import CoreBluetooth
import Combine

// MARK: - BLE Service UUIDs
struct BLEServiceUUIDs {
    // Standard Services
    static let battery = CBUUID(string: "0000180F-0000-1000-8000-00805F9B34FB")
    static let deviceInfo = CBUUID(string: "0000180A-0000-1000-8000-00805F9B34FB")

    // Custom Services
    static let radarData = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF0")
    static let thermalData = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF1")
    static let sensorData = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF2")
}

struct BLECharacteristicUUIDs {
    // Battery
    static let batteryLevel = CBUUID(string: "00002A19-0000-1000-8000-00805F9B34FB")

    // Device Info
    static let manufacturerName = CBUUID(string: "00002A29-0000-1000-8000-00805F9B34FB")
    static let modelNumber = CBUUID(string: "00002A24-0000-1000-8000-00805F9B34FB")
    static let firmwareRevision = CBUUID(string: "00002A26-0000-1000-8000-00805F9B34FB")

    // Radar
    static let radarDistance = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF3")
    static let radarImage = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF4")

    // Thermal
    static let thermalImage = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF5")
    static let ambientTemp = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF6")

    // Sensor
    static let signalStrength = CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF7")
}

// MARK: - Models
struct RadarDeviceInfo {
    var name: String
    var manufacturer: String?
    var model: String?
    var firmware: String?
}

struct SensorData {
    var batteryLevel: Int = 0
    var temperature: Float = 0.0
    var distance: Float = 0.0
    var signalStrength: Int = 0
    var timestamp: Date = Date()
}

struct RadarImageData {
    var width: Int
    var height: Int
    var pixels: [UInt8]
    var timestamp: Date
}

// MARK: - BLE Manager
class BLEManager: NSObject, ObservableObject {
    // Published properties
    @Published var isScanning = false
    @Published var isConnected = false
    @Published var discoveredDevices: [CBPeripheral] = []
    @Published var deviceInfo = RadarDeviceInfo(name: "")
    @Published var sensorData = SensorData()
    @Published var radarImage: RadarImageData?
    @Published var thermalImage: RadarImageData?
    @Published var errorMessage: String?

    // Private properties
    private var centralManager: CBCentralManager!
    private var connectedPeripheral: CBPeripheral?
    private var characteristics: [CBUUID: CBCharacteristic] = [:]

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: .main)
    }

    // MARK: - Public Methods
    func startScanning() {
        guard centralManager.state == .poweredOn else {
            errorMessage = "Bluetooth açık değil"
            return
        }

        discoveredDevices.removeAll()
        isScanning = true

        centralManager.scanForPeripherals(
            withServices: [BLEServiceUUIDs.battery],
            options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
        )

        // 10 saniye sonra taramayı durdur
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) { [weak self] in
            self?.stopScanning()
        }
    }

    func stopScanning() {
        centralManager.stopScan()
        isScanning = false
    }

    func connect(to peripheral: CBPeripheral) {
        stopScanning()
        connectedPeripheral = peripheral
        peripheral.delegate = self
        centralManager.connect(peripheral, options: nil)
    }

    func disconnect() {
        if let peripheral = connectedPeripheral {
            centralManager.cancelPeripheralConnection(peripheral)
        }
    }

    // MARK: - Private Methods
    private func discoverServices() {
        guard let peripheral = connectedPeripheral else { return }

        peripheral.discoverServices([
            BLEServiceUUIDs.battery,
            BLEServiceUUIDs.deviceInfo,
            BLEServiceUUIDs.radarData,
            BLEServiceUUIDs.thermalData,
            BLEServiceUUIDs.sensorData
        ])
    }

    private func processData(from characteristic: CBCharacteristic) {
        guard let data = characteristic.value else { return }

        switch characteristic.uuid {
        case BLECharacteristicUUIDs.batteryLevel:
            if let batteryLevel = data.first {
                sensorData.batteryLevel = Int(batteryLevel)
            }

        case BLECharacteristicUUIDs.manufacturerName:
            deviceInfo.manufacturer = String(data: data, encoding: .utf8)

        case BLECharacteristicUUIDs.modelNumber:
            deviceInfo.model = String(data: data, encoding: .utf8)

        case BLECharacteristicUUIDs.firmwareRevision:
            deviceInfo.firmware = String(data: data, encoding: .utf8)

        case BLECharacteristicUUIDs.radarDistance:
            if data.count >= 4 {
                let distance = data.withUnsafeBytes { $0.load(as: Float.self) }
                sensorData.distance = distance
            }

        case BLECharacteristicUUIDs.ambientTemp:
            if data.count >= 4 {
                let temp = data.withUnsafeBytes { $0.load(as: Float.self) }
                sensorData.temperature = temp
            }

        case BLECharacteristicUUIDs.radarImage:
            parseImageData(data: data, isRadar: true)

        case BLECharacteristicUUIDs.thermalImage:
            parseImageData(data: data, isRadar: false)

        default:
            break
        }
    }

    private func parseImageData(data: Data, isRadar: Bool) {
        guard data.count >= 4 else { return }

        let width = Int(data[0]) | (Int(data[1]) << 8)
        let height = Int(data[2]) | (Int(data[3]) << 8)

        let pixels = Array(data[4...])

        let imageData = RadarImageData(
            width: width,
            height: height,
            pixels: pixels,
            timestamp: Date()
        )

        if isRadar {
            radarImage = imageData
        } else {
            thermalImage = imageData
        }
    }
}

// MARK: - CBCentralManagerDelegate
extension BLEManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            errorMessage = nil
        case .poweredOff:
            errorMessage = "Bluetooth kapalı"
        case .unauthorized:
            errorMessage = "Bluetooth izni verilmemiş"
        case .unsupported:
            errorMessage = "Bu cihaz Bluetooth desteklemiyor"
        default:
            errorMessage = "Bluetooth durumu bilinmiyor"
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        // PhoneRadar veya FLIR başlangıcıyla cihazları filtrele
        if let name = peripheral.name,
           (name.hasPrefix("PhoneRadar") || name.hasPrefix("FLIR") || name.hasPrefix("Radar")) {
            if !discoveredDevices.contains(where: { $0.identifier == peripheral.identifier }) {
                discoveredDevices.append(peripheral)
            }
        }
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        isConnected = true
        deviceInfo.name = peripheral.name ?? "Bilinmeyen Cihaz"
        discoverServices()
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        isConnected = false
        connectedPeripheral = nil
        characteristics.removeAll()

        if let error = error {
            errorMessage = "Bağlantı kesildi: \(error.localizedDescription)"
        }
    }

    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        errorMessage = "Bağlanılamadı: \(error?.localizedDescription ?? "Bilinmeyen hata")"
    }
}

// MARK: - CBPeripheralDelegate
extension BLEManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let error = error {
            errorMessage = "Servisler bulunamadı: \(error.localizedDescription)"
            return
        }

        guard let services = peripheral.services else { return }

        for service in services {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        if let error = error {
            print("Karakteristikler bulunamadı: \(error.localizedDescription)")
            return
        }

        guard let characteristics = service.characteristics else { return }

        for characteristic in characteristics {
            self.characteristics[characteristic.uuid] = characteristic

            // Read initial values
            if characteristic.properties.contains(.read) {
                peripheral.readValue(for: characteristic)
            }

            // Enable notifications
            if characteristic.properties.contains(.notify) {
                peripheral.setNotifyValue(true, for: characteristic)
            }
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        if let error = error {
            print("Değer okunamadı: \(error.localizedDescription)")
            return
        }

        processData(from: characteristic)
    }
}
