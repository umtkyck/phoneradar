# PhoneRadar Android App

Native Android uygulaması - Kotlin ve Jetpack Compose ile geliştirilmiştir.

## Teknolojiler

- **Dil**: Kotlin 1.9+
- **UI Framework**: Jetpack Compose
- **BLE**: Android Bluetooth LE API
- **Minimum SDK**: 26 (Android 8.0)
- **Target SDK**: 34 (Android 14)
- **Build Tool**: Gradle 8.0+

## Özellikler

- Android Bluetooth LE API ile BLE cihazına bağlanma
- Gerçek zamanlı radar/termal görüntü gösterimi
- Material Design 3 UI
- Cihaz durumu ve sensör verilerini görüntüleme
- Batarya seviyesi takibi
- Background scanning desteği

## BLE Servisleri

### Standart Servisler
- **Battery Service**: `0000180f-0000-1000-8000-00805f9b34fb`
- **Device Information**: `0000180a-0000-1000-8000-00805f9b34fb`

### Custom Servisler
- **Radar Data**: `12345678-1234-5678-1234-56789abcdef0`
- **Thermal Data**: `12345678-1234-5678-1234-56789abcdef1`
- **Sensor Data**: `12345678-1234-5678-1234-56789abcdef2`

Detaylı BLE protokolü için `/shared/BLE_PROTOCOL.md` dosyasına bakın.

## Kurulum

### Gereksinimler
1. Android Studio Hedgehog (2023.1.1) veya üzeri
2. JDK 17+
3. Android cihaz (BLE özellikli)

### Adımlar

```bash
# Android Studio ile projeyi aç
# File > Open > android/ klasörünü seç

# veya terminal'den
cd android
./gradlew build
```

## Proje Yapısı

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/phoneradar/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── ui/
│   │   │   │   │   ├── RadarScreen.kt
│   │   │   │   │   ├── DeviceConnectionScreen.kt
│   │   │   │   │   └── components/
│   │   │   │   │       └── RadarCard.kt
│   │   │   │   ├── models/
│   │   │   │   │   ├── RadarDevice.kt
│   │   │   │   │   └── SensorData.kt
│   │   │   │   ├── services/
│   │   │   │   │   ├── BLEManager.kt
│   │   │   │   │   └── RadarDataProcessor.kt
│   │   │   │   └── viewmodels/
│   │   │   │       └── RadarViewModel.kt
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   └── build.gradle.kts
├── gradle/
├── build.gradle.kts
└── settings.gradle.kts
```

## Android Manifest İzinleri

```xml
<!-- Bluetooth izinleri -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />

<!-- Android 12+ için -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- Konum izni (BLE scanning için gerekli) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- BLE özelliği -->
<uses-feature
    android:name="android.hardware.bluetooth_le"
    android:required="true" />
```

## BLE Kullanımı

### Cihaz Tarama

```kotlin
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult

class BLEManager(private val context: Context) {
    private val bluetoothAdapter: BluetoothAdapter? =
        BluetoothAdapter.getDefaultAdapter()

    private val bleScanner: BluetoothLeScanner? =
        bluetoothAdapter?.bluetoothLeScanner

    fun startScanning() {
        val scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                // Cihaz bulundu
                val device = result.device
                val deviceName = device.name
            }
        }

        bleScanner?.startScan(scanCallback)
    }
}
```

### GATT Bağlantısı

```kotlin
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothProfile

fun connectToDevice(device: BluetoothDevice) {
    val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(
            gatt: BluetoothGatt,
            status: Int,
            newState: Int
        ) {
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    gatt.discoverServices()
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    // Bağlantı kesildi
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                // Servisleri oku
                val batteryService = gatt.getService(
                    UUID.fromString("0000180f-0000-1000-8000-00805f9b34fb")
                )
            }
        }
    }

    device.connectGatt(context, false, gattCallback)
}
```

## Gradle Dependencies

```kotlin
dependencies {
    // Jetpack Compose
    implementation("androidx.compose.ui:ui:1.5.4")
    implementation("androidx.compose.material3:material3:1.1.2")
    implementation("androidx.activity:activity-compose:1.8.1")

    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Accompanist (izinler için)
    implementation("com.google.accompanist:accompanist-permissions:0.33.2-alpha")
}
```

## Build & Run

### Android Studio'dan

1. Android Studio'da projeyi açın
2. `Build > Make Project` ile build edin
3. Android cihazınızı USB ile bağlayın veya emulator başlatın
4. `Run > Run 'app'` ile çalıştırın

### Terminal'den

```bash
cd android

# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Install to device
./gradlew installDebug
```

## Test

```bash
# Unit testleri çalıştır
./gradlew test

# Instrumented testleri çalıştır
./gradlew connectedAndroidTest
```

## İzin İsteme (Runtime)

```kotlin
val permissionLauncher = rememberLauncherForActivityResult(
    ActivityResultContracts.RequestMultiplePermissions()
) { permissions ->
    if (permissions.all { it.value }) {
        // Tüm izinler verildi
        startBLEScanning()
    }
}

// İzinleri iste
LaunchedEffect(Unit) {
    permissionLauncher.launch(
        arrayOf(
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.ACCESS_FINE_LOCATION,
        )
    )
}
```

## ProGuard

Release build için ProGuard kuralları:

```proguard
# Bluetooth classes
-keep class android.bluetooth.** { *; }
-keep interface android.bluetooth.** { *; }

# Compose
-keep class androidx.compose.** { *; }
```

## Sorun Giderme

### BLE Cihaz Bulunamıyor
- Bluetooth'un açık olduğundan emin olun
- Konum servislerinin açık olduğunu kontrol edin (Android 10+)
- Runtime izinlerinin verildiğini kontrol edin
- Cihazın pairing modunda olduğunu kontrol edin

### İzin Hatası
- `AndroidManifest.xml`'de izinlerin tanımlı olduğunu kontrol edin
- Runtime izinleri için kod eklediğinizden emin olun
- Android 12+ için yeni BLE izinlerini kullanın

### Bağlantı Kesiliyor
- Cihazın menzil içinde olduğundan emin olun
- Batarya optimizasyonlarını kontrol edin
- GATT bağlantısını `autoConnect=false` ile kullanın

## Lisans

MIT
