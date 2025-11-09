# PhoneRadar BLE Protokol Dökümanı

Bu döküman, PhoneRadar cihazının Bluetooth Low Energy (BLE) protokolünü tanımlar.

## Genel Bakış

PhoneRadar cihazı, BLE 4.0+ protokolü kullanarak telefon/tablet ile iletişim kurar. Cihaz, GATT (Generic Attribute Profile) sunucusu olarak çalışır ve birden fazla servis sunar.

## Cihaz Bilgileri

- **Cihaz Adı**: `PhoneRadar-XXXX` (XXXX: cihaz seri numarası)
- **BLE Versiyonu**: 4.0+
- **Güç Modu**: Low Energy
- **Bağlantı Aralığı**: ~10 metre (engelsiz)
- **Data Rate**: Max 1 Mbps

## GATT Servisleri

### 1. Battery Service (Standart)

**Service UUID**: `0000180f-0000-1000-8000-00805f9b34fb`

Cihazın batarya durumunu sağlar.

#### Characteristics

| Characteristic | UUID | Properties | Format | Açıklama |
|----------------|------|------------|--------|----------|
| Battery Level | `00002a19-0000-1000-8000-00805f9b34fb` | Read, Notify | uint8 | Batarya seviyesi (0-100%) |

**Örnek Kullanım:**
```
Read: [0x64] → %100
Notify: Her 60 saniyede bir veya %10 değişimde
```

---

### 2. Device Information Service (Standart)

**Service UUID**: `0000180a-0000-1000-8000-00805f9b34fb`

Cihaz hakkında genel bilgiler.

#### Characteristics

| Characteristic | UUID | Properties | Format | Açıklama |
|----------------|------|------------|--------|----------|
| Manufacturer Name | `00002a29-0000-1000-8000-00805f9b34fb` | Read | UTF-8 | Üretici adı |
| Model Number | `00002a24-0000-1000-8000-00805f9b34fb` | Read | UTF-8 | Model numarası |
| Serial Number | `00002a25-0000-1000-8000-00805f9b34fb` | Read | UTF-8 | Seri numarası |
| Hardware Revision | `00002a27-0000-1000-8000-00805f9b34fb` | Read | UTF-8 | Donanım versiyonu |
| Firmware Revision | `00002a26-0000-1000-8000-00805f9b34fb` | Read | UTF-8 | Firmware versiyonu |

**Örnek Değerler:**
```
Manufacturer: "PhoneRadar Inc."
Model: "PR-100"
Serial: "PR100-2024-001234"
Hardware: "v1.2"
Firmware: "v2.3.1"
```

---

### 3. Radar Data Service (Custom)

**Service UUID**: `12345678-1234-5678-1234-56789abcdef0`

Radar mesafe ve görüntü verilerini sağlar.

#### Characteristics

| Characteristic | UUID | Properties | Format | Açıklama |
|----------------|------|------------|--------|----------|
| Radar Distance | `12345678-1234-5678-1234-56789abcdef3` | Read, Notify | float32 | Mesafe (metre) |
| Radar Image | `12345678-1234-5678-1234-56789abcdef4` | Notify | byte[] | Radar görüntü verisi |
| Radar Config | `12345678-1234-5678-1234-56789abcdef8` | Read, Write | uint16 | Ayarlar (refresh rate, range) |

##### Radar Distance Format

```
[0-3]: float32 (little-endian) - mesafe (metre)

Örnek: 0x00 0x00 0x80 0x3F → 1.0 metre
```

##### Radar Image Format

```
[0-1]: uint16 (little-endian) - genişlik (pixel)
[2-3]: uint16 (little-endian) - yükseklik (pixel)
[4-n]: uint8[] - pixel verileri (grayscale 0-255)

Varsayılan boyut: 32x24 = 768 byte
```

**Örnek:**
```
Width: 0x20 0x00 (32)
Height: 0x18 0x00 (24)
Pixels: [128, 130, 125, ... ] (768 byte)
```

##### Radar Config Format

```
[0]: uint8 - refresh rate (Hz): 1-30
[1]: uint8 - max range (metre): 0.5-5.0

Örnek: 0x0A 0x03 → 10 Hz, 3 metre
```

---

### 4. Thermal Data Service (Custom)

**Service UUID**: `12345678-1234-5678-1234-56789abcdef1`

Termal kamera verilerini sağlar.

#### Characteristics

| Characteristic | UUID | Properties | Format | Açıklama |
|----------------|------|------------|--------|----------|
| Thermal Image | `12345678-1234-5678-1234-56789abcdef5` | Notify | byte[] | Termal görüntü |
| Ambient Temperature | `12345678-1234-5678-1234-56789abcdef6` | Read, Notify | float32 | Ortam sıcaklığı (°C) |
| Thermal Config | `12345678-1234-5678-1234-56789abcdef9` | Read, Write | uint16 | Termal ayarlar |

##### Thermal Image Format

```
[0-1]: uint16 (little-endian) - genişlik
[2-3]: uint16 (little-endian) - yükseklik
[4-n]: uint16[] - sıcaklık verileri (°C * 100)

Varsayılan: 32x24, her pixel 2 byte (uint16)
Toplam: 4 + (32 * 24 * 2) = 1540 byte
```

**Örnek:**
```
Width: 32
Height: 24
Pixel[0,0]: 0x09 0x0C (3081) → 30.81°C
```

##### Thermal Config Format

```
[0]: uint8 - color palette (0-5)
  0: Iron (varsayılan)
  1: Rainbow
  2: White Hot
  3: Black Hot
  4: Arctic
  5: Lava

[1]: uint8 - emissivity (0-100, %1-100)

Örnek: 0x00 0x5F → Iron palette, %95 emissivity
```

---

### 5. Sensor Data Service (Custom)

**Service UUID**: `12345678-1234-5678-1234-56789abcdef2`

Çeşitli sensör verilerini sağlar.

#### Characteristics

| Characteristic | UUID | Properties | Format | Açıklama |
|----------------|------|------------|--------|----------|
| Signal Strength | `12345678-1234-5678-1234-56789abcdef7` | Read, Notify | int8 | RSSI (dBm) |
| Timestamp | `12345678-1234-5678-1234-56789abcdefa` | Read | uint32 | Unix timestamp |
| Device Status | `12345678-1234-5678-1234-56789abcdefb` | Read, Notify | uint8 | Durum bayrakları |

##### Device Status Flags

```
Bit 0: Radar aktif (1) / inaktif (0)
Bit 1: Termal kamera aktif (1) / inaktif (0)
Bit 2: Batarya şarj oluyor (1) / şarj olmuyor (0)
Bit 3: Hata durumu (1) / normal (0)
Bit 4-7: Rezerve

Örnek: 0b00000011 (0x03) → Radar ve termal aktif
```

---

## Bağlantı Akışı

### 1. Cihaz Keşfi (Discovery)

```
1. BLE Tarama başlat
2. "PhoneRadar" prefixi ile cihazları filtrele
3. Cihaz bulunca taramayı durdur
```

### 2. Bağlantı (Connection)

```
1. GATT sunucusuna bağlan
2. Servis keşfi yap (discoverServices)
3. İlgili karakteristikleri bul
4. Bildirimleri (notifications) etkinleştir
```

### 3. Veri Okuma

```
1. Battery Level'ı oku (ilk bağlantıda)
2. Device Information'ı oku
3. Radar/Thermal Image için notify aktif et
4. Sensor Data için notify aktif et
```

### 4. Veri Güncelleme Sıklığı

| Veri | Güncelleme |
|------|-----------|
| Battery Level | 60 saniyede bir |
| Radar Image | 10 Hz (varsayılan) |
| Thermal Image | 9 Hz (hardware limiti) |
| Distance | 10 Hz |
| Temperature | 1 Hz |
| Signal Strength | 5 saniyede bir |

---

## Hata Kodları

Cihaz, characteristic okuma/yazma sırasında aşağıdaki GATT hata kodlarını döndürebilir:

| Kod | Açıklama |
|-----|----------|
| 0x00 | Başarılı |
| 0x01 | Invalid Handle |
| 0x02 | Read Not Permitted |
| 0x03 | Write Not Permitted |
| 0x06 | Request Not Supported |
| 0x0E | Unlikely Error |

---

## Güvenlik

- **Pairing**: Opsiyonel (cihaz ayarından açılabilir)
- **Encryption**: BLE 4.0 AES-128 (pairing aktifse)
- **Authentication**: Yok (varsayılan)

---

## Enerji Tüketimi

| Mod | Akım | Açıklama |
|-----|------|----------|
| Bekleme | ~5 µA | BLE advertisement aktif |
| Bağlı (idle) | ~50 µA | Bağlı ama veri yok |
| Radar aktif | ~20 mA | Radar + BLE data transfer |
| Termal aktif | ~80 mA | Termal kamera + BLE |
| Full aktif | ~100 mA | Her şey aktif |

**Batarya Ömrü (1000 mAh):**
- Sadece bekleme: ~3 ay
- Normal kullanım (2 saat/gün): ~15 gün
- Sürekli aktif: ~10 saat

---

## Platform Desteği

### Web (Web Bluetooth API)

```javascript
const device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: 'PhoneRadar' }],
  optionalServices: [
    '0000180f-0000-1000-8000-00805f9b34fb', // Battery
    '12345678-1234-5678-1234-56789abcdef0', // Radar
    '12345678-1234-5678-1234-56789abcdef1', // Thermal
  ]
});
```

**Desteklenen Tarayıcılar:**
- Chrome 56+ (Android, macOS, Windows, Linux)
- Edge 79+
- Opera 43+
- Safari 16.4+ (partial support)

### iOS (CoreBluetooth)

```swift
let services = [
    CBUUID(string: "0000180F-0000-1000-8000-00805F9B34FB"),
    CBUUID(string: "12345678-1234-5678-1234-56789ABCDEF0")
]
centralManager.scanForPeripherals(withServices: services)
```

**Minimum iOS:** 15.0

### Android (Bluetooth LE API)

```kotlin
val filter = ScanFilter.Builder()
    .setServiceUuid(ParcelUuid.fromString(
        "12345678-1234-5678-1234-56789abcdef0"
    ))
    .build()
scanner.startScan(listOf(filter), scanSettings, callback)
```

**Minimum Android:** 8.0 (API 26)

---

## Test ve Debug

### nRF Connect (Mobil Uygulama)

1. Play Store/App Store'dan "nRF Connect" indir
2. Scan başlat
3. PhoneRadar cihazını bul ve bağlan
4. Servisleri ve karakteristikleri görüntüle
5. Manuel read/write/notify test et

### Web Bluetooth Terminal

```javascript
// Console'da test
const server = await device.gatt.connect();
const service = await server.getPrimaryService('0000180f-0000-1000-8000-00805f9b34fb');
const char = await service.getCharacteristic('00002a19-0000-1000-8000-00805f9b34fb');
const value = await char.readValue();
console.log('Battery:', value.getUint8(0));
```

---

## Örnek Kod Parçaları

### Web - Radar Görüntü Okuma

```typescript
async function subscribeToRadarImage(device: BluetoothDevice) {
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(
    '12345678-1234-5678-1234-56789abcdef0'
  );
  const char = await service.getCharacteristic(
    '12345678-1234-5678-1234-56789abcdef4'
  );

  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', (event) => {
    const value = event.target.value;
    const width = value.getUint16(0, true);
    const height = value.getUint16(2, true);
    const pixels = new Uint8Array(value.buffer, 4);

    console.log(`Radar image: ${width}x${height}`);
    // pixels dizisini işle
  });
}
```

### iOS - Batarya Okuma

```swift
func peripheral(_ peripheral: CBPeripheral,
                didDiscoverCharacteristicsFor service: CBService,
                error: Error?) {
    if let characteristics = service.characteristics {
        for characteristic in characteristics {
            if characteristic.uuid == CBUUID(string: "2A19") {
                peripheral.readValue(for: characteristic)
                peripheral.setNotifyValue(true, for: characteristic)
            }
        }
    }
}

func peripheral(_ peripheral: CBPeripheral,
                didUpdateValueFor characteristic: CBCharacteristic,
                error: Error?) {
    if characteristic.uuid == CBUUID(string: "2A19"),
       let value = characteristic.value {
        let batteryLevel = value[0]
        print("Battery: \(batteryLevel)%")
    }
}
```

### Android - Termal Görüntü Okuma

```kotlin
override fun onCharacteristicChanged(
    gatt: BluetoothGatt,
    characteristic: BluetoothGattCharacteristic,
    value: ByteArray
) {
    if (characteristic.uuid.toString() == "12345678-1234-5678-1234-56789abcdef5") {
        val width = ((value[1].toInt() and 0xFF) shl 8) or (value[0].toInt() and 0xFF)
        val height = ((value[3].toInt() and 0xFF) shl 8) or (value[2].toInt() and 0xFF)

        val temps = FloatArray((width * height))
        for (i in 0 until width * height) {
            val offset = 4 + (i * 2)
            val tempRaw = ((value[offset + 1].toInt() and 0xFF) shl 8) or
                          (value[offset].toInt() and 0xFF)
            temps[i] = tempRaw / 100f
        }

        Log.d("Thermal", "Image: ${width}x${height}, temps: ${temps.size}")
    }
}
```

---

## Sıkça Sorulan Sorular

### Q: Neden cihaz bulunmuyor?

**A:**
- Cihazın açık ve advertisement modunda olduğundan emin olun
- Bluetooth izinlerinin verildiğini kontrol edin
- Web'de HTTPS bağlantısı gereklidir
- Android'de konum servisleri açık olmalıdır

### Q: Bağlantı neden sürekli kopuyor?

**A:**
- Cihazın menzil içinde (10m) olduğunu kontrol edin
- Batarya seviyesinin yeterli olduğunu kontrol edin
- Connection interval ayarlarını optimize edin
- Notification flood yapmamaya dikkat edin

### Q: Görüntü verisi gelmedi?

**A:**
- Notification'ın aktif edildiğini kontrol edin
- MTU (Maximum Transmission Unit) boyutunu kontrol edin
- Varsayılan MTU: 23 byte, artırılabilir: 512 byte
- Büyük veriler için chunking gerekebilir

### Q: İki cihaz aynı anda bağlanabilir mi?

**A:**
- Hayır, cihaz aynı anda tek bir client'a bağlanır
- Multi-connection için firmware güncellemesi gerekir

---

## Changelog

### v2.0.0 (2024-01)
- Termal görüntü desteği eklendi
- Radar config karakteristiği eklendi
- MTU 512 byte'a çıkarıldı

### v1.5.0 (2023-12)
- Signal strength characteristic eklendi
- Device status flags eklendi
- Enerji optimizasyonları

### v1.0.0 (2023-10)
- İlk sürüm
- Temel radar ve batarya servisleri

---

## Lisans

Bu protokol dökümanı MIT lisansı altında lisanslanmıştır.

## İletişim

Destek: support@phoneradar.com
Döküman güncellemeleri: https://docs.phoneradar.com
