# Nuur Salah · Web sitesi

Nuur Salah iOS uygulamasının tanıtım ve mağaza zorunlulukları sitesi. Tamamen statiktir:
sunucu kodu, veritabanı, form, çerez, analiz ya da izleme yoktur. Tema ve gezinme için yalnız yerel bir JavaScript dosyası çalışır; dış istek veya analiz içermez.

- **Diller:** Türkçe (varsayılan, kök adreste) ve İngilizce (`/en` altında)
- **Sayfalar:** ana sayfa, gizlilik politikası, kullanım koşulları, destek, hesap silme, 404
- **Bağımlılık:** yalnızca derleme sırasında `marked` (Markdown → HTML). Yazı tipleri projeye dahildir; Google Fonts'a istek gitmez.

| Sayfa | Türkçe | İngilizce |
|---|---|---|
| Ana sayfa | `/` | `/en` |
| Gizlilik politikası | `/gizlilik` | `/en/privacy` |
| Kullanım koşulları | `/kosullar` | `/en/terms` |
| Destek | `/destek` | `/en/support` |
| Hesap silme | `/hesap-silme` | `/en/delete-account` |

## Yerelde çalıştırma

Node.js 20 ya da üstü gerekir.

```bash
npm install
```

```bash
npm run dev
```

Site `http://localhost:3000` adresinde açılır. Kaynak dosyalar değişince kendiliğinden yeniden derlenir; sayfayı yenilemeniz yeterlidir.

Yalnızca derlemek için (çıktı `dist/` klasörüne yazılır):

```bash
npm run build
```

## Vercel'e yükleme

1. Bu klasörün içeriğini GitHub'da `nuur-salah-web` deposuna yükleyin (`node_modules` ve `dist` hariç; `.gitignore` bunları zaten dışarıda tutar).
2. [vercel.com](https://vercel.com) → GitHub ile giriş → **Add New Project** → depoyu seçin → **Deploy**.
   Ayar yapmanız gerekmez; derleme komutu ve çıktı klasörü `vercel.json` içinde tanımlıdır.
3. **Settings › Domains** bölümünden alan adınızı ekleyin ve Vercel'in verdiği DNS kayıtlarını alan adı panelinize girin.
4. Alan adı `nuursalah.com` dışında bir şey olursa `site.config.mjs` içindeki `siteUrl` değerini güncelleyin (canonical, sitemap ve paylaşım görseli adresleri buradan üretilir).

Site başka bir deponun alt klasöründe duruyorsa Vercel'de **Root Directory** olarak bu klasörü seçin.

## Yer tutucular

Hepsi tek dosyada: **`site.config.mjs`**. Köşeli parantezli değeri gerçek değerle değiştirip yeniden yayınlamanız yeterlidir. `npm run build` her çalıştığında doldurulmamış yer tutucuları listeler.

| Yer tutucu | Ayar | Doldurulmadan önce | Doldurulunca |
|---|---|---|---|
| `[APP_STORE_LINK]` | `appStoreLink` | Rozet tıklanamaz, "Yakında" etiketi | Rozet mağazaya bağlanır |
| `[GOOGLE_PLAY_LINK]` | `googlePlayLink` | "Yakında" | Rozet mağazaya bağlanır |
| `[DESTEK_EPOSTA]` | `supportEmail` | Metinde yer tutucu olarak görünür | Destek, hesap silme ve alt bilgide e-posta bağlantısı |
| `[INSTAGRAM]` `[TIKTOK]` `[FACEBOOK]` | `social.*` | İkon **gösterilmez** (boş hesaba bağlantı verilmez) | Alt bilgide ikon görünür |
| `[QR_APP_STORE]` `[QR_GOOGLE_PLAY]` | `qrAppStore`, `qrGooglePlay` | Kesik çizgili "Yakında" kutusu | QR görseli (dosyayı `src/assets/img/` içine koyup yolunu yazın, örn. `/assets/img/qr-app-store.svg`) |

Yayına çıkmadan önce `[DESTEK_EPOSTA]` mutlaka doldurulmalıdır; diğerleri "Yakında" durumunda yayınlanabilir.

## Sonradan verilecek görseller

| Görsel | Nereye |
|---|---|
| Logo | `src/assets/img/favicon.svg`, `logo.svg`, `favicon.png` (64×64), `apple-touch-icon.png` (180×180) dosyalarını değiştirin. Üst ve alt bilgideki küçük işaret `build.mjs` içindeki `logoMark` işlevindedir. |
| Paylaşım (Open Graph) görseli | `src/assets/img/og.png` (1200×630) |
| Kahraman bölüm arka planı | Şimdilik çizim bir cami manzarası görünür. Fotoğraf kullanmak için dosyayı `src/assets/img/` içine koyun, `site.config.mjs › heroImage` değerine yolunu yazın; çizimin yerini alır. |
| Özellik kartı görselleri (isteğe bağlı) | Dosyaları `src/assets/img/features/` içine koyun, `site.config.mjs › featureImages` içine yollarını yazın. Boşken desenli şerit görünür. |
| Ekran görüntüleri | Dosyaları `src/assets/img/screens/` içine koyun, `site.config.mjs › screenshots` listesinde `src` değerlerini yazın. Başlıklar `src/locales/*.json › screens.items` içindedir. Liste 4-6 öğe olabilir. |
| App Store rozeti | Şimdiki rozet sade bir yer tutucudur. Apple'ın resmî "App Store'dan İndirin" rozetini [Apple pazarlama kaynaklarından](https://developer.apple.com/app-store/marketing/guidelines/) indirip `build.mjs › storeBadge` içinde kullanın. |

## Metinleri güncelleme

- **Gizlilik politikası:** `src/content/tr/privacy.md` (İngilizcesi `src/content/en/privacy.md`).
  Avukat onaylı Markdown metnini dosyanın `---` ile ayrılmış üst kısmının altına yapıştırın. Başlıklar (`##`, `###`), tablolar ve listeler kendiliğinden biçimlenir; içindekiler menüsü `##` başlıklarından üretilir.
- **Kullanım koşulları:** `src/content/<dil>/terms.md`
- **Hesap silme:** `src/content/<dil>/delete-account.md`
- **Ana sayfa, destek ve SSS metinleri:** `src/locales/<dil>.json`

Dosyaların başındaki alanlar:

```yaml
---
title: Gizlilik politikası
description: Arama sonuçlarında görünen kısa açıklama.
updated: 2026-11-12
draft: true
---
```

`draft: true` iken sayfada "taslak" notu görünür, sayfa arama motorlarına kapatılır (`noindex`) ve site haritasına girmez. **Kesin metni koyduğunuzda bu satırı silin** ve `updated` tarihini güncelleyin.

Metin içinde şu kısaltmalar kullanılabilir: `{{supportEmail}}`, `{{privacyUrl}}`, `{{termsUrl}}`, `{{supportUrl}}`, `{{deleteAccountUrl}}`.

## Yeni dil ekleme

1. `src/locales/tr.json` dosyasını kopyalayıp `src/locales/<kod>.json` olarak çevirin (`slugs` alanı o dildeki adresleri belirler).
2. `src/content/tr/` klasörünü `src/content/<kod>/` olarak kopyalayıp çevirin.
3. `site.config.mjs › locales` listesine dili ekleyin (hazır satırlar yorum olarak duruyor).

Dil değiştirici, `hreflang` etiketleri ve site haritası kendiliğinden güncellenir. Arapça için `dir: 'rtl'` yeterlidir: stiller mantıksal özelliklerle yazıldığından düzen sağdan sola döner. Arapça ve Japonca için projedeki yazı tipleri bu alfabeleri içermez; o diller eklenirken uygun bir yazı tipi de eklenmelidir.

## Klasör yapısı

```
site.config.mjs      Ayarlar ve yer tutucular
build.mjs            Derleyici ve sayfa şablonları
vercel.json          Vercel ayarları ve güvenlik başlıkları
scripts/dev.mjs      Yerel önizleme sunucusu
src/locales/         Arayüz metinleri (dil başına bir dosya)
src/content/         Uzun metinler (Markdown)
src/assets/          Stil, yazı tipleri, görseller
dist/                Derleme çıktısı (depoya girmez)
```

## Yazı tipi lisansları

Playfair Display ve Plus Jakarta Sans, SIL Open Font License ile dağıtılır; lisans metinleri `src/assets/fonts/` içindedir.


## 16 Kasım 2026 — görsel bağımsız yenileme

Masaüstündeki kaynak klasör korundu. Production yayını yapılmadı.

- Destek adresi merkezi ayarda info@nuursalah.com oldu; TR/EN sayfalarına aktarılır. Posta kutusuna test mesajı gönderilmedi.
- Ürün odaklı koyu yeşil/altın hero, CSS ile çalışan mobil menü ve destek çağrısı eklendi.
- Gündüz/gece ve Apple Watch sahneleri gerçek ekranlar gelene kadar açıkça bekleyen görsel alanları gösterir.
- site.config.mjs içindeki productScreens.hero, .day, .night, .watch gerçek görsel yollarını alır. Mevcut screenshots listesi korunur. Hero görseli öncelikli, diğerleri tembel yüklenir.
- Ekran içerikleri uydurulmadı. Mevcut özellikler ve Premium listesi gerçek uygulamayla doğrulanmalıdır.
- Mağaza hedefi eksik olduğu için “App Store’da” ifadesi kaldırıldı; mağaza, QR ve sosyal hedefler bekliyor.
- Yasal Markdown belgeleri ve taslak/noindex işleyişi korundu.
- Yeni framework, analiz, form veya dış font eklenmedi. (17 Kasım güncellemesinde tema ve gezinme için yerel JavaScript eklendi.)
- Yerel sunucu yalnız 127.0.0.1 adresinde dinler.

Derleme ve yerel bağlantı kontrolleri yapıldı. Masaüstü hero Chrome’da görsel olarak incelendi. Mobil cihaz görünümü ve gerçek ekranların yerleşimi henüz görsel olarak test edilmedi.


## 17 Kasım 2026 — nötr temalar ve yeni gezinme

Önceki yeşil–altın yüzey yönü kullanıcı talebiyle değiştirildi. Sayfa arka planları yeşil değildir: gündüz #f5f5f7, gece #111113. Yeşil site yüzeylerinden kaldırıldı. Altın yalnız küçük vurgularda kaldı.

- Header’da ışık ikonlu tek tema anahtarı var. İlk açılışta sistem tercihi alınır; kullanıcı seçimi yerel depolamadaki nuur-theme anahtarında hatırlanır. Ağ isteği veya izleme yapılmaz.
- Tema anahtarı tüm sayfalarda aynı davranır; klavye ve erişilebilir switch durumu vardır.
- Özellikler/Ekranlar/Premium/Destek başlıkları doğrudan hedeflerine gider. Masaüstünde üzerine gelince veya klavyeyle odaklanınca alt menü açılır. Dokunmatik kullanımda ok düğmesi aynı alt menüyü açar. Escape ve dışarı tıklama kapatır.
- Alt başlıklar kendi özellik/ekran/Premium maddelerine veya destek bölümlerine gider.
- İndir düğmesi nötr renkte, yuvarlak ve modern hale getirildi.
- Gerçek uygulama ikonu için site.config.mjs → appIcon; bölüm ikonları için appIcons.clock/bell/compass/book vb. yerel dosya yolları kullanılacak. Henüz paylaşılmadıkları için gerçek uygulama ikonlarının yerleştirildiği iddia edilmez; mevcut web ikonları geçicidir.
- CSP yalnız kendi alanımızdaki betiğe izin verecek şekilde güncellendi; inline veya dış kaynak betiği eklenmedi.

Doğrulama: derleme ve JavaScript sözdizimi başarılı. 12 sayfada 986 yerel bağlantı/varlık/anchor kontrolünde hata veya yinelenen ID yok. Chrome’da açık tema, koyu tema, temanın destek sayfasında korunması, destek sayfasının açılması, özellik alt menüsü ve Kıble bağlantısı doğrulandı. Gerçek mobil cihaz ve hover işaretçisiyle görsel test ayrıca yapılacak.

Canlı site ve masaüstündeki kaynak klasör değiştirilmedi.
