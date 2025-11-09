# PhoneRadar iOS App

Native iOS uygulaması - Swift ve SwiftUI ile geliştirilmiştir.

## Teknolojiler

- **Dil**: Swift 5.9+
- **UI Framework**: SwiftUI
- **BLE**: CoreBluetooth
- **Minimum iOS**: 15.0
- **Xcode**: 15.0+

## Özellikler

- CoreBluetooth ile BLE cihazına bağlanma
- Gerçek zamanlı radar/termal görüntü gösterimi
- Cihaz durumu ve sensör verilerini görüntüleme
- Batarya seviyesi takibi
- Background mode desteği

## BLE Servisleri

### Standart Servisler
- **Battery Service**: `0x180F`
- **Device Information**: `0x180A`

### Custom Servisler
- **Radar Data**: `12345678-1234-5678-1234-56789abcdef0`
- **Thermal Data**: `12345678-1234-5678-1234-56789abcdef1`
- **Sensor Data**: `12345678-1234-5678-1234-56789abcdef2`

Detaylı BLE protokolü için `/shared/BLE_PROTOCOL.md` dosyasına bakın.

## Kurulum

### Gereksinimler
1. macOS 13.0+
2. Xcode 15.0+
3. iOS cihaz (BLE özellikli)

### Adımlar

```bash
# Xcode ile projeyi aç
open PhoneRadar.xcodeproj

# Veya Xcode'u manuel olarak açıp projeyi seçin
```

### Info.plist Ayarları

Bluetooth izinleri için aşağıdaki key'leri ekleyin:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Radar cihazına bağlanmak için Bluetooth gerekli</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Radar cihazı ile iletişim kurmak için Bluetooth gerekli</string>
```

## Proje Yapısı

```
ios/
├── PhoneRadar/
│   ├── App/
│   │   └── PhoneRadarApp.swift
│   ├── Views/
│   │   ├── RadarView.swift
│   │   ├── DeviceConnectionView.swift
│   │   └── Components/
│   │       └── RadarCardView.swift
│   ├── Models/
│   │   ├── RadarDevice.swift
│   │   └── SensorData.swift
│   ├── Services/
│   │   ├── BLEManager.swift
│   │   └── RadarDataProcessor.swift
│   └── Resources/
│       ├── Assets.xcassets
│       └── Info.plist
├── PhoneRadarTests/
└── PhoneRadar.xcodeproj
```

## CoreBluetooth Kullanımı

### Cihaza Bağlanma

```swift
import CoreBluetooth

class BLEManager: NSObject, ObservableObject {
    private var centralManager: CBCentralManager!

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    func startScanning() {
        centralManager.scanForPeripherals(
            withServices: [CBUUID(string: "0x180F")],
            options: nil
        )
    }
}
```

### Karakteristik Okuma

```swift
func peripheral(_ peripheral: CBPeripheral,
                didDiscoverCharacteristicsFor service: CBService,
                error: Error?) {
    guard let characteristics = service.characteristics else { return }

    for characteristic in characteristics {
        if characteristic.uuid == CBUUID(string: "battery_level") {
            peripheral.readValue(for: characteristic)
        }
    }
}
```

## Build & Run

1. Xcode'da projeyi açın
2. Development team'i seçin (Signing & Capabilities)
3. iOS cihazınızı seçin
4. `Cmd + R` ile çalıştırın

## Test

```bash
# Unit testleri çalıştır
Cmd + U

# veya terminal'den
xcodebuild test -scheme PhoneRadar -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Geliştirme Notları

- BLE bağlantısı gerçek cihazda test edilmelidir (simülatörde çalışmaz)
- Background mode için "Uses Bluetooth LE accessories" seçeneğini aktif edin
- Güç tüketimini azaltmak için gereksiz notification'ları kapatın

## Sorun Giderme

### BLE Cihaz Bulunamıyor
- Bluetooth'un açık olduğundan emin olun
- Cihazın açık ve pairing modunda olduğunu kontrol edin
- Info.plist'te izinlerin tanımlı olduğunu kontrol edin

### Bağlantı Kesiliyor
- Cihazın menzil içinde olduğundan emin olun
- Batarya seviyesini kontrol edin
- Background mode ayarlarını kontrol edin

## Lisans

MIT
