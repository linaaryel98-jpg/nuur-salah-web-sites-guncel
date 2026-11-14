// Nuur Salah web sitesi ayarları.
// Köşeli parantezli değerler YER TUTUCUDUR. Gerçek değeri yazdığınızda
// ilgili bağlantı / görsel sitede kendiliğinden etkinleşir; yer tutucu
// kaldığı sürece site "Yakında" durumunu gösterir ya da öğeyi gizler.

export default {
  // Yayın adresi (sonunda / olmadan). Canonical, sitemap ve Open Graph için kullanılır.
  siteUrl: 'https://nuursalah.com',

  appName: 'Nuur Salah',
  copyright: '© 2026 Ömer Yolcu',

  // Mağaza bağlantıları — örn. 'https://apps.apple.com/app/id0000000000'
  appStoreLink: '[APP_STORE_LINK]',
  googlePlayLink: '[GOOGLE_PLAY_LINK]',

  // Destek e-postası — örn. 'destek@nuursalah.com'
  supportEmail: '[DESTEK_EPOSTA]',

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

  // Özellik kartlarının üst görselleri (isteğe bağlı). Anahtarlar: clock, bell, compass, book,
  // steps, beads, kaaba, mosque. Örn. clock: '/assets/img/features/vakitler.jpg'. Boşken desenli şerit görünür.
  featureImages: {},

  // Ekran görüntüleri. src: null iken yer tutucu çerçeve gösterilir.
  // Örn. src: '/assets/img/screens/vakitler.png'. Başlıklar src/locales/*.json › screens.items içinde.
  screenshots: [
    { key: 'prayer', src: null },
    { key: 'qibla', src: null },
    { key: 'quran', src: null },
    { key: 'guides', src: null },
    { key: 'tasbih', src: null },
  ],

  // Diller. İlk dil varsayılandır ve kök adreste (/) yayınlanır; diğerleri /<kod>/ altında.
  // Yeni dil eklemek için: src/locales/<kod>.json + src/content/<kod>/ ekleyin ve buraya yazın.
  // Arapça için dir: 'rtl' verin; düzen kendiliğinden sağdan sola döner.
  locales: [
    { code: 'tr', dir: 'ltr', ogLocale: 'tr_TR' },
    { code: 'en', dir: 'ltr', ogLocale: 'en_US' },
    // { code: 'de', dir: 'ltr', ogLocale: 'de_DE' },
    // { code: 'fr', dir: 'ltr', ogLocale: 'fr_FR' },
    // { code: 'ar', dir: 'rtl', ogLocale: 'ar_SA' },
    // { code: 'ja', dir: 'ltr', ogLocale: 'ja_JP' },
  ],
};
