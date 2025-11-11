# Vercel Deployment Rehberi

## Yöntem 1: GitHub ile Otomatik Deploy (Önerilen)

### Adım 1: Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. "Sign Up" tıkla
3. **"Continue with GitHub"** seç (önemli!)
4. GitHub hesabınla giriş yap

### Adım 2: Yeni Proje Oluştur
1. Vercel dashboard'da **"Add New..."** → **"Project"** tıkla
2. **"Import Git Repository"** seç
3. **phoneradar** repository'sini bul ve **"Import"** tıkla

### Adım 3: Proje Ayarları
```
Framework Preset: Next.js
Root Directory: web
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Adım 4: Environment Variables (Opsiyonel)
Şimdilik gerek yok, ama ileride ekleyebilirsiniz:
```
NEXT_PUBLIC_APP_NAME=PhoneRadar
```

### Adım 5: Deploy!
**"Deploy"** butonuna tıkla ve bekle (2-3 dakika)

✅ Deploy tamamlandığında:
- Otomatik domain: `phoneradar-xxx.vercel.app`
- Her git push otomatik deploy olur
- Preview deployments her PR için

---

## Yöntem 2: Vercel CLI ile Manuel Deploy

### Kurulum
```bash
# Vercel CLI'yi global olarak kur
npm install -g vercel

# Vercel'e giriş yap
vercel login
```

### Deploy
```bash
# Proje klasörüne git
cd /home/user/phoneradar/web

# İlk deploy (production)
vercel --prod

# Sorulacak sorular:
# Set up and deploy? → Y
# Which scope? → (hesabını seç)
# Link to existing project? → N
# What's your project's name? → phoneradar
# In which directory is your code located? → ./
# Want to override settings? → N
```

### Sonraki Deploylar
```bash
cd web
vercel --prod
```

---

## Yöntem 3: GitHub Actions (CI/CD)

### .github/workflows/deploy.yml
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Vercel
        run: |
          cd web
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Önemli Notlar

### 🔧 Build Settings
- **Root Directory**: `web` olarak ayarlayın
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 🌐 Custom Domain (Opsiyonel)
1. Vercel dashboard → Project Settings → Domains
2. Add Domain: `www.phoneradar.com`
3. DNS kayıtlarını ayarla

### 📊 Environment Variables
Şimdilik gerek yok, ama şunları ekleyebilirsiniz:
```
NEXT_PUBLIC_APP_NAME=PhoneRadar
NEXT_PUBLIC_API_URL=https://api.phoneradar.com
```

### 🔄 Otomatik Deploy
- **main branch**: Production deploy
- **diğer branch'ler**: Preview deploy
- **Pull Request**: Preview deploy + comment

---

## Deploy Sonrası Kontrol

### ✅ Kontrol Listesi
- [ ] Site açılıyor mu? → `https://phoneradar-xxx.vercel.app`
- [ ] Favicon görünüyor mu? → Tab'da 📡 ikonu
- [ ] Web Bluetooth çalışıyor mu? → "Bağlan" butonu
- [ ] Responsive mı? → Mobil'de test et
- [ ] OG image → https://www.opengraph.xyz/ ile test

### 🐛 Hata Alırsanız
1. Vercel dashboard → Deployments → Log'lara bak
2. Build error varsa:
   ```bash
   cd web
   npm run build
   # Local'de test et
   ```

---

## Hızlı Başlangıç

**En kolay yol:**
```bash
# 1. Vercel CLI kur
npm install -g vercel

# 2. Deploy et
cd /home/user/phoneradar/web
vercel --prod

# 3. Soruları cevapla
# 4. Link'i kopyala ve aç!
```

**İlk deployment ~2-3 dakika sürer.**

---

## Fiyatlandırma

- **Hobby (Free)**:
  - Unlimited deployments
  - Custom domains
  - HTTPS
  - 100 GB bandwidth/ay
  - **Bu proje için yeterli! ✅**

- **Pro ($20/ay)**:
  - 1 TB bandwidth
  - Advanced analytics
  - Team collaboration

---

## Sonraki Adımlar

Deploy sonrası:
1. ✅ Domain'i paylaş
2. ✅ Analytics ekle
3. ✅ Custom domain (opsiyonel)
4. ✅ Performance monitoring
