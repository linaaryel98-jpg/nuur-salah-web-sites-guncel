// Nuur Salah web sitesi ayarları.
// Köşeli parantezli değerler YER TUTUCUDUR. Gerçek değeri yazdığınızda
// ilgili bağlantı / görsel sitede kendiliğinden etkinleşir; yer tutucu
// kaldığı sürece site "Yakında" durumunu gösterir ya da öğeyi gizler.

export default {
  // Yayın adresi (sonunda / olmadan). Canonical, sitemap ve Open Graph için kullanılır.
  siteUrl: 'https://nuursalah.com',

  appName: 'Nuur Salah',

  // Gerçek uygulama dosyaları paylaşıldığında yerel yollarını ekleyin.
  appIcon: '/assets/img/brand/nuur-salah-app-original.png',
  appIcons: {},
  copyright: '© 2026 Ömer Yolcu',

  // Mağaza bağlantıları — örn. 'https://apps.apple.com/app/id0000000000'
  appStoreLink: '[APP_STORE_LINK]',
  googlePlayLink: '[GOOGLE_PLAY_LINK]',

  // Destek e-postası — örn. 'destek@nuursalah.com'
  supportEmail: 'info@nuursalah.com',

  // Sosyal hesaplar — tam adres, örn. 'https://instagram.com/nuursalah'.
  // Yer tutucu kaldıkça ikon alt bilgide gösterilmez (boş hesaba bağlantı verilmez).
  social: {
    instagram: '[INSTAGRAM]',
    tiktok: '[TIKTOK]',
    facebook: '[FACEBOOK]',
  },

  // QR kod görselleri — örn. '/assets/img/qr-app-store.svg'
  // (dosyayı src/assets/img/ içine koyun).
  qrAppStore: '[QR_APP_STORE]',
  qrGooglePlay: '[QR_GOOGLE_PLAY]',

  // Kahraman bölüm arka plan görseli — örn. '/assets/img/hero.jpg'. null: desenli zemin.
  heroImage: null,

  // Gerçek uygulama ekranları; boşken açıkça bekleyen görsel alanı gösterilir.
  productScreens: { hero: '/assets/img/screens/languages/nuur-salah-six-languages.gif', heroPoster: '/assets/img/screens/languages/tr-poster.jpg', day: '/assets/img/screens/gallery/theme-day.png', night: '/assets/img/screens/gallery/theme-night-v2.png', watch: null },

  // Özellik kartlarının üst görselleri (isteğe bağlı). Anahtarlar: clock, bell, compass, book,
  // steps, beads, kaaba, mosque. Örn. clock: '/assets/img/features/vakitler.jpg'. Boşken desenli şerit görünür.
  featureImages: {},

  // Ekran görüntüleri. src: null iken yer tutucu çerçeve gösterilir.
  // Örn. src: '/assets/img/screens/vakitler.png'. Başlıklar src/locales/*.json › screens.items içinde.
  screenshots: [
    { key: 'quran', src: '/assets/img/screens/gallery/quran.png' },
    { key: 'guides', src: '/assets/img/screens/gallery/guides.png' },
    { key: 'prayer', src: '/assets/img/screens/gallery/prayer-sequence.gif' },
    { key: 'qibla', src: '/assets/img/screens/gallery/qibla-istanbul.png' },
    { key: 'tasbih', src: '/assets/img/screens/gallery/tasbih.png' },
    { key: 'widget-day', src: '/assets/img/screens/gallery/widget-day.png' },
    { key: 'widget-night', src: '/assets/img/screens/gallery/widget-night.png' },
  ],

  // Diller. İlk dil varsayılandır ve kök adreste (/) yayınlanır; diğerleri /<kod>/ altında.
  // Yeni dil eklemek için: src/locales/<kod>.json + src/content/<kod>/ ekleyin ve buraya yazın.
  // Arapça için dir: 'rtl' verin; düzen kendiliğinden sağdan sola döner.
  locales: [
    { code: 'tr', dir: 'ltr', ogLocale: 'tr_TR', flag: '/assets/icons/flags/tr.svg' },
    { code: 'en', dir: 'ltr', ogLocale: 'en_US', flag: '/assets/icons/flags/gb.svg' },
    // { code: 'de', dir: 'ltr', ogLocale: 'de_DE' },
    // { code: 'fr', dir: 'ltr', ogLocale: 'fr_FR' },
    // { code: 'ar', dir: 'rtl', ogLocale: 'ar_SA' },
    // { code: 'ja', dir: 'ltr', ogLocale: 'ja_JP' },
  ],
};
