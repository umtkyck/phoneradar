package com.phoneradar.app.services

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.*

// MARK: - BLE Service UUIDs
object BLEServiceUUIDs {
    // Standard Services
    val BATTERY = UUID.fromString("0000180F-0000-1000-8000-00805F9B34FB")
    val DEVICE_INFO = UUID.fromString("0000180A-0000-1000-8000-00805F9B34FB")

    // Custom Services
    val RADAR_DATA = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF0")
    val THERMAL_DATA = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF1")
    val SENSOR_DATA = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF2")
}

object BLECharacteristicUUIDs {
    // Battery
    val BATTERY_LEVEL = UUID.fromString("00002A19-0000-1000-8000-00805F9B34FB")

    // Device Info
    val MANUFACTURER_NAME = UUID.fromString("00002A29-0000-1000-8000-00805F9B34FB")
    val MODEL_NUMBER = UUID.fromString("00002A24-0000-1000-8000-00805F9B34FB")
    val FIRMWARE_REVISION = UUID.fromString("00002A26-0000-1000-8000-00805F9B34FB")

    // Radar
    val RADAR_DISTANCE = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF3")
    val RADAR_IMAGE = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF4")

    // Thermal
    val THERMAL_IMAGE = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF5")
    val AMBIENT_TEMP = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF6")

    // Sensor
    val SIGNAL_STRENGTH = UUID.fromString("12345678-1234-5678-1234-56789ABCDEF7")
}

// MARK: - Data Models
data class RadarDeviceInfo(
    val name: String = "",
    val manufacturer: String? = null,
    val model: String? = null,
    val firmware: String? = null
)

data class SensorData(
    val batteryLevel: Int = 0,
    val temperature: Float = 0f,
    val distance: Float = 0f,
    val signalStrength: Int = 0,
    val timestamp: Long = System.currentTimeMillis()
)

data class RadarImageData(
    val width: Int,
    val height: Int,
    val pixels: ByteArray,
    val timestamp: Long = System.currentTimeMillis()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as RadarImageData

        if (width != other.width) return false
        if (height != other.height) return false
        if (!pixels.contentEquals(other.pixels)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = width
        result = 31 * result + height
        result = 31 * result + pixels.contentHashCode()
        return result
    }
}

// MARK: - BLE Manager
@SuppressLint("MissingPermission")
class BLEManager(private val context: Context) {

    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private val bluetoothLeScanner: BluetoothLeScanner? = bluetoothAdapter?.bluetoothLeScanner

    private var bluetoothGatt: BluetoothGatt? = null
    private val characteristics = mutableMapOf<UUID, BluetoothGattCharacteristic>()

    // State flows
    private val _isScanning = MutableStateFlow(false)
    val isScanning: StateFlow<Boolean> = _isScanning.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _discoveredDevices = MutableStateFlow<List<BluetoothDevice>>(emptyList())
    val discoveredDevices: StateFlow<List<BluetoothDevice>> = _discoveredDevices.asStateFlow()

    private val _deviceInfo = MutableStateFlow(RadarDeviceInfo())
    val deviceInfo: StateFlow<RadarDeviceInfo> = _deviceInfo.asStateFlow()

    private val _sensorData = MutableStateFlow(SensorData())
    val sensorData: StateFlow<SensorData> = _sensorData.asStateFlow()

    private val _radarImage = MutableStateFlow<RadarImageData?>(null)
    val radarImage: StateFlow<RadarImageData?> = _radarImage.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    // MARK: - Public Methods
    fun startScanning() {
        if (!isBluetoothEnabled()) {
            _errorMessage.value = "Bluetooth açık değil"
            return
        }

        _discoveredDevices.value = emptyList()
        _isScanning.value = true

        bluetoothLeScanner?.startScan(scanCallback)
    }

    fun stopScanning() {
        bluetoothLeScanner?.stopScan(scanCallback)
        _isScanning.value = false
    }

    fun connect(device: BluetoothDevice) {
        stopScanning()
        bluetoothGatt = device.connectGatt(context, false, gattCallback)
    }

    fun disconnect() {
        bluetoothGatt?.disconnect()
        bluetoothGatt?.close()
        bluetoothGatt = null
        _isConnected.value = false
        characteristics.clear()
    }

    fun isBluetoothEnabled(): Boolean {
        return bluetoothAdapter?.isEnabled == true
    }

    // MARK: - Scan Callback
    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val device = result.device
            val deviceName = device.name

            // Filter for PhoneRadar, FLIR, or Radar devices
            if (deviceName != null &&
                (deviceName.startsWith("PhoneRadar") ||
                        deviceName.startsWith("FLIR") ||
                        deviceName.startsWith("Radar"))
            ) {
                val currentDevices = _discoveredDevices.value.toMutableList()
                if (!currentDevices.any { it.address == device.address }) {
                    currentDevices.add(device)
                    _discoveredDevices.value = currentDevices
                }
            }
        }

        override fun onScanFailed(errorCode: Int) {
            _errorMessage.value = "Tarama başarısız: $errorCode"
            _isScanning.value = false
        }
    }

    // MARK: - GATT Callback
    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    _isConnected.value = true
                    _deviceInfo.value = RadarDeviceInfo(name = gatt.device.name ?: "Bilinmeyen Cihaz")
                    gatt.discoverServices()
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    _isConnected.value = false
                    _errorMessage.value = "Bağlantı kesildi"
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                gatt.services.forEach { service ->
                    service.characteristics.forEach { characteristic ->
                        characteristics[characteristic.uuid] = characteristic

                        // Read initial values
                        if (characteristic.properties and BluetoothGattCharacteristic.PROPERTY_READ != 0) {
                            gatt.readCharacteristic(characteristic)
                        }

                        // Enable notifications
                        if (characteristic.properties and BluetoothGattCharacteristic.PROPERTY_NOTIFY != 0) {
                            gatt.setCharacteristicNotification(characteristic, true)

                            // Write descriptor to enable notifications
                            characteristic.descriptors.forEach { descriptor ->
                                if (descriptor.uuid == UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")) {
                                    descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                                    gatt.writeDescriptor(descriptor)
                                }
                            }
                        }
                    }
                }
            }
        }

        override fun onCharacteristicRead(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            status: Int
        ) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                processCharacteristic(characteristic)
            }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic
        ) {
            processCharacteristic(characteristic)
        }
    }

    // MARK: - Data Processing
    private fun processCharacteristic(characteristic: BluetoothGattCharacteristic) {
        val data = characteristic.value ?: return

        when (characteristic.uuid) {
            BLECharacteristicUUIDs.BATTERY_LEVEL -> {
                if (data.isNotEmpty()) {
                    _sensorData.value = _sensorData.value.copy(
                        batteryLevel = data[0].toInt() and 0xFF
                    )
                }
            }

            BLECharacteristicUUIDs.MANUFACTURER_NAME -> {
                _deviceInfo.value = _deviceInfo.value.copy(
                    manufacturer = String(data, Charsets.UTF_8)
                )
            }

            BLECharacteristicUUIDs.MODEL_NUMBER -> {
                _deviceInfo.value = _deviceInfo.value.copy(
                    model = String(data, Charsets.UTF_8)
                )
            }

            BLECharacteristicUUIDs.FIRMWARE_REVISION -> {
                _deviceInfo.value = _deviceInfo.value.copy(
                    firmware = String(data, Charsets.UTF_8)
                )
            }

            BLECharacteristicUUIDs.RADAR_DISTANCE -> {
                if (data.size >= 4) {
                    val distance = ByteBuffer.wrap(data)
                        .order(ByteOrder.LITTLE_ENDIAN)
                        .float
                    _sensorData.value = _sensorData.value.copy(distance = distance)
                }
            }

            BLECharacteristicUUIDs.AMBIENT_TEMP -> {
                if (data.size >= 4) {
                    val temp = ByteBuffer.wrap(data)
                        .order(ByteOrder.LITTLE_ENDIAN)
                        .float
                    _sensorData.value = _sensorData.value.copy(temperature = temp)
                }
            }

            BLECharacteristicUUIDs.RADAR_IMAGE -> {
                parseImageData(data, isRadar = true)
            }

            BLECharacteristicUUIDs.THERMAL_IMAGE -> {
                parseImageData(data, isRadar = false)
            }
        }
    }

    private fun parseImageData(data: ByteArray, isRadar: Boolean) {
        if (data.size < 4) return

        val buffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN)
        val width = buffer.getShort(0).toInt() and 0xFFFF
        val height = buffer.getShort(2).toInt() and 0xFFFF

        val pixels = data.copyOfRange(4, data.size)

        val imageData = RadarImageData(
            width = width,
            height = height,
            pixels = pixels
        )

        if (isRadar) {
            _radarImage.value = imageData
        }
    }
}
