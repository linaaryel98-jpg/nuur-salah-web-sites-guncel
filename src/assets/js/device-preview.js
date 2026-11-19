// Genuine phone captures and native app-source watch renders, selected by page locale.
export function previewPhone(code) {
 const lang=code==='tr'?'tr':'en';
 const alt=lang==='tr'?'Nuur Salah uygulamasının gerçek Türkçe karşılama ekranı':'Actual English welcome screen from the Nuur Salah app';
 return `<figure class="product-screen product-screen-hero"><div class="product-frame live-phone-frame authentic-phone-frame"><span class="iphone-island" aria-hidden="true"></span><span class="iphone-home" aria-hidden="true"></span><img class="authentic-app-screen" src="/assets/img/screens/languages/${lang}-authentic.png" alt="${alt}" width="1290" height="2621" fetchpriority="high"></div></figure>`;
}
export function previewWatch(code,kind) {
 const lang=['tr','en','de','fr','ar','ja'].includes(code)?code:'en';
 const round=kind==='galaxy';
 return `<div class="watch-shell watch-${kind} watch-photo watch-live"><img src="/assets/img/watches/${round?'galaxy':'apple'}-front-case-v3.png" alt="" width="${round?'1254':'1133'}" height="${round?'1254':'1388'}"><div class="watch-live-glass"><img class="native-watch-screen" src="/assets/img/app-native/watch-${round?'round-':''}home-${lang}.png" lang="${lang}" alt="${lang==='tr'?'Uygulamanın kaynak kodundan üretilen saat ana ekranı':'Watch home screen rendered from the app source'}" width="552" height="${round?'552':'672'}"></div></div>`;
}
