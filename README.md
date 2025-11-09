# PhoneRadar - FLIR One Radar Card

Telefona takılan BLE radar cihazı için multi-platform uygulama.

## Proje Yapısı

```
phoneradar/
├── web/              # Next.js web uygulaması (Vercel)
├── ios/              # Native iOS uygulaması (Swift)
├── android/          # Native Android uygulaması (Kotlin)
└── shared/           # Ortak BLE protokol ve tipler
```

## Teknolojiler

### Web
- **Framework**: Next.js 14 + TypeScript
- **BLE**: Web Bluetooth API
- **Deployment**: Vercel
- **UI**: Tailwind CSS + shadcn/ui

### iOS
- **Dil**: Swift
- **BLE**: CoreBluetooth framework
- **UI**: SwiftUI

### Android
- **Dil**: Kotlin
- **BLE**: Android Bluetooth LE API
- **UI**: Jetpack Compose

## Özellikler

- 📡 BLE ile radar cihazına bağlanma
- 🎯 Gerçek zamanlı radar/termal görüntüleme
- 📱 Cross-platform destek (Web, iOS, Android)
- 🔋 Düşük enerji tüketimi (BLE)
- 📊 Cihaz durumu ve batarya takibi

## Geliştirme

### Web
```bash
cd web
npm install
npm run dev
```

### iOS
Xcode ile `ios/PhoneRadar.xcodeproj` dosyasını açın.

### Android
Android Studio ile `android/` klasörünü açın.

## Deployment

Web uygulaması otomatik olarak Vercel'e deploy edilir.
