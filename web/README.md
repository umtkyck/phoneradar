# PhoneRadar Web App

Next.js ile geliştirilmiş web uygulaması. Vercel'de deploy edilir.

## Özellikler

- ⚡ Next.js 14 + TypeScript
- 🎨 Tailwind CSS
- 📱 Web Bluetooth API
- 🔥 FLIR One benzeri radar kartı
- 📊 Gerçek zamanlı veri görselleştirme
- 🌐 Responsive tasarım

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

## Build

```bash
npm run build
npm start
```

## Web Bluetooth API Gereksinimleri

Web Bluetooth API kullanmak için:

1. **HTTPS** bağlantısı gereklidir (localhost hariç)
2. Desteklenen tarayıcılar:
   - Chrome 56+ (Android, macOS, Windows, Linux)
   - Edge 79+
   - Opera 43+
   - Safari 16.4+ (kısıtlı destek)

## Vercel Deployment

### Otomatik Deployment

GitHub'a push yaptığınızda otomatik olarak deploy edilir:

```bash
git push origin main
```

### Manuel Deployment

```bash
npm install -g vercel
vercel
```

### Environment Variables

Vercel dashboard'da aşağıdaki değişkenleri ayarlayın:

```
NEXT_PUBLIC_APP_NAME=PhoneRadar
```

## Proje Yapısı

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Ana sayfa
│   │   └── globals.css        # Global stiller
│   ├── components/            # React components
│   │   └── FlirOneRadarCard.tsx
│   ├── services/              # BLE ve diğer servisler
│   │   └── bleService.ts
│   └── types/                 # TypeScript tipleri
│       └── bluetooth.ts
├── public/                    # Static dosyalar
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## BLE Kullanımı

### Cihaza Bağlanma

```typescript
const device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: 'PhoneRadar' }],
  optionalServices: ['battery_service']
});

const server = await device.gatt.connect();
```

### Veri Okuma

```typescript
const service = await server.getPrimaryService('battery_service');
const characteristic = await service.getCharacteristic('battery_level');
const value = await characteristic.readValue();
const batteryLevel = value.getUint8(0);
```

Detaylı BLE protokolü için `/shared/BLE_PROTOCOL.md` dosyasına bakın.

## Radar Kartı Kullanımı

```tsx
import FlirOneRadarCard from '@/components/FlirOneRadarCard';

export default function Page() {
  return <FlirOneRadarCard />;
}
```

## Özelleştirme

### Renk Paleti

`globals.css` dosyasında CSS değişkenlerini düzenleyin:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}
```

### Radar Ayarları

`FlirOneRadarCard.tsx` içinde simülasyon parametrelerini değiştirebilirsiniz:

```typescript
const data: number[][] = [];
for (let y = 0; y < 24; y++) {  // Yükseklik
  for (let x = 0; x < 32; x++) { // Genişlik
    // ...
  }
}
```

## Performans

- Lighthouse Score: 95+
- Web Vitals optimized
- Code splitting ile bundle boyutu optimize edilmiş
- Image optimization (Next.js Image)

## Sorun Giderme

### Web Bluetooth çalışmıyor

**Çözüm:**
- HTTPS kullandığınızdan emin olun
- Tarayıcının Web Bluetooth desteklediğini kontrol edin
- `chrome://flags` → "Experimental Web Platform features" aktif edin

### Build hatası

**Çözüm:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript hataları

**Çözüm:**
```bash
npm run type-check
```

## Test

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Lisans

MIT
