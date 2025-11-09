package com.phoneradar.app.viewmodels

import android.app.Application
import android.bluetooth.BluetoothDevice
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.phoneradar.app.services.BLEManager
import com.phoneradar.app.services.RadarDeviceInfo
import com.phoneradar.app.services.RadarImageData
import com.phoneradar.app.services.SensorData
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

class BLEViewModel(application: Application) : AndroidViewModel(application) {

    private val bleManager = BLEManager(application)

    // Expose state flows from BLEManager
    val isScanning: StateFlow<Boolean> = bleManager.isScanning
        .stateIn(viewModelScope, SharingStarted.Lazily, false)

    val isConnected: StateFlow<Boolean> = bleManager.isConnected
        .stateIn(viewModelScope, SharingStarted.Lazily, false)

    val discoveredDevices: StateFlow<List<BluetoothDevice>> = bleManager.discoveredDevices
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    val deviceInfo: StateFlow<RadarDeviceInfo> = bleManager.deviceInfo
        .stateIn(viewModelScope, SharingStarted.Lazily, RadarDeviceInfo())

    val sensorData: StateFlow<SensorData> = bleManager.sensorData
        .stateIn(viewModelScope, SharingStarted.Lazily, SensorData())

    val radarImage: StateFlow<RadarImageData?> = bleManager.radarImage
        .stateIn(viewModelScope, SharingStarted.Lazily, null)

    val errorMessage: StateFlow<String?> = bleManager.errorMessage
        .stateIn(viewModelScope, SharingStarted.Lazily, null)

    // Public methods
    fun startScanning() = bleManager.startScanning()

    fun stopScanning() = bleManager.stopScanning()

    fun connect(device: BluetoothDevice) = bleManager.connect(device)

    fun disconnect() = bleManager.disconnect()

    fun isBluetoothEnabled() = bleManager.isBluetoothEnabled()

    override fun onCleared() {
        super.onCleared()
        bleManager.disconnect()
    }
}
