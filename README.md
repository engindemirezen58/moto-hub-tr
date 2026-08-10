# MotoHub Türkiye

AI AGENT PROMPTU — Motosiklet Platformu (MotoHub tarzı)

Aşağıdaki metni olduğu gibi AI coding agent'ına (Claude Code, Cursor, v0, vb.) yapıştırabilirsin.

ROL

Sen kıdemli bir full-stack developer'sın. Aşağıda tarif edilen, Türkiye pazarına yönelik motosiklet odaklı çok modüllü bir ilan platformu geliştireceksin. "sahibinden.com" mantığında ama sadece motosiklet ekosistemine (satış, yedek parça, kurye istihdamı, servis haritası) odaklanmış bir ürün. Baştan sona çalışır, production'a yakın kalitede bir proje istiyorum; placeholder/mock ile sınırlı kalma, gerçek backend ve veritabanı bağlantısı kur.

PROJE ÖZETİ

Site 4 ana modülden oluşuyor:

Motosiklet İlanları — 2. el ve sıfır motosiklet alım-satım ilanları

Yedek Parça & Aksesuar — motor parçaları, lastik, kask, kıyafet vb. ilanları

Kurye İş İlanları — motosiklet kuryeleri için iş arama / mağazaların kurye arama ilanı açması

Servis Haritası — Google Maps üzerinde en yakın motor tamir servislerini gösteren, filtrelenebilir harita modülü

Tasarım dili: orta modernlikte, sade, hızlı, mobil öncelikli (responsive). Aşırı minimalist ya da aşırı gösterişli değil; güven veren, ilan sitesi kullanıcısının alışkın olduğu bir okunabilirlik ve yoğunlukta.

TEKNOLOJİ YIĞINI

Frontend: Next.js 15 (App Router) + React 19 + TypeScript

Styling: Tailwind CSS + shadcn/ui bileşen kütüphanesi

Backend: Next.js Server Actions + API Routes (ayrı bir backend servisine gerek yok, Next.js full-stack olarak kullanılacak)

Veritabanı: PostgreSQL + Prisma ORM

Kimlik doğrulama: NextAuth.js (Auth.js) — e-posta/şifre + Google ile giriş

Dosya/Fotoğraf depolama: S3 uyumlu bir storage (Cloudflare R2 veya AWS S3) — ilan fotoğrafları için

Harita: Google Maps JavaScript API + Places API (New) — searchNearby endpoint'i ile en yakın servisleri bulma

Arama/Filtreleme: Başlangıçta PostgreSQL üzerinde indekslenmiş sorgularla; ilan sayısı büyürse ileride Algolia/Meilisearch'e geçilebilecek şekilde soyutlanmış bir arama katmanı yaz

Deployment hedefi: Vercel uyumlu yapı

Önemli not: Bu proje ileride mobil uygulamaya dönüştürülecek. Bu yüzden:

İş mantığını (veri modelleri, validasyon şemaları — Zod ile, API sözleşmeleri) frontend UI kodundan olabildiğince ayrı ve yeniden kullanılabilir tut.

Next.js'i PWA (installable, offline-capable) olarak yapılandır; bu en düşük ek maliyetle "app hissi" verir.

İleride React Native/Expo'ya geçilirse API katmanının (route handlers) doğrudan tekrar kullanılabilir olmasını sağla.

KULLANICI ROLLERİ VE ÜYELİK SİSTEMİ

Üç rol:

Bireysel Kullanıcı: İlan verebilir (motosiklet, parça), kurye ilanlarına başvurabilir, favori ekleyebilir, mesajlaşabilir.

Mağaza/Bayi Hesabı: Ek olarak: doğrulanmış rozet (mavi tik benzeri), kendi vitrin/mağaza sayfası (tüm ilanlarının listelendiği), kurye iş ilanı açabilme, çoklu ilan yönetim paneli, temel istatistikler (görüntülenme sayısı vb.).

Admin: İlan onaylama/reddetme, kullanıcı yönetimi, şikayet/rapor yönetimi, servis noktası ekleme/düzenleme (harita modülü için), öne çıkan ilan (premium) atama.

Kayıt akışı: E-posta + telefon doğrulama (SMS OTP opsiyonel, ilk fazda e-posta doğrulama yeterli). Mağaza hesabı için ek alanlar: işletme adı, vergi no (opsiyonel), adres, çalışma saatleri.

SAYFA / ROTA HARİTASI

/ — Ana sayfa (4 modüle hızlı erişim, öne çıkan ilanlar, arama kutusu)

/motosikletler — Motosiklet ilan listesi + filtreler

/motosikletler/[slug] — İlan detay sayfası

/motosikletler/ilan-ver — Yeni motosiklet ilanı oluşturma

/parca-aksesuar — Yedek parça & aksesuar listesi + filtreler

/parca-aksesuar/[slug] — Parça ilan detay sayfası

/parca-aksesuar/ilan-ver — Yeni parça ilanı oluşturma

/kurye-ilanlari — Kurye iş ilanları listesi (kuryeler için)

/kurye-ilanlari/[slug] — İş ilanı detayı + başvuru formu

/kurye-ilanlari/ilan-ver — Mağaza/bayi için kurye arama ilanı açma

/servisler — Harita üzerinde motor tamir servisleri

/magaza/[magaza-slug] — Mağaza vitrin sayfası

/hesabim — Kullanıcı paneli (ilanlarım, favorilerim, mesajlarım, başvurularım, ayarlar)

/hesabim/mesajlar — Alıcı-satıcı mesajlaşma

/giris, /kayit — Auth sayfaları

/admin — Admin paneli (ayrı layout, role-based koruma)

MODÜL 1 — MOTOSİKLET İLANLARI (2. El + Sıfır)

İlan formu alanları: marka, model, üretim yılı, kilometre (0 km ise "Sıfır" işaretlenir), silindir hacmi (cc), motor tipi, vites tipi (manuel/otomatik/yarı otomatik), yakıt tipi, renk, fiyat, takasa açık mı, hasar kaydı var mı, kimden (sahibinden/galeriden/yetkili bayiden), açıklama, konum (il/ilçe), en az 1 en fazla 15 fotoğraf.

Filtreler: marka/model, yıl aralığı, km aralığı, cc aralığı, fiyat aralığı, vites tipi, il/ilçe, kimden, sadece takaslı, sadece hasarsız. Sıralama: en yeni, fiyat artan/azalan, en çok görüntülenen.

İlan detay sayfası: fotoğraf galerisi (büyütmeli), tüm teknik özellikler tablo halinde, satıcı bilgisi/rozeti, "Mesaj Gönder" ve "Favorilere Ekle" butonları, benzer ilanlar bölümü, şikayet et linki.

MODÜL 2 — YEDEK PARÇA & AKSESUAR

Kategori ağacı: Motor Parçaları, Fren Sistemi, Lastik & Jant, Elektrik/Elektronik, Kaporta/Plastik Aksam, Kask, Kıyafet & Koruyucu, Bagaj & Çanta, Diğer Aksesuar.

İlan formu: kategori, alt kategori, uyumlu marka/model (çoklu seçim olabilir — "birçok modelle uyumlu" gibi), durum (sıfır/kullanılmış/yenilenmiş), marka, fiyat, açıklama, fotoğraflar.

Filtreler: kategori, uyumlu marka/model, durum, fiyat aralığı, konum. Sıralama motosiklet modülüyle aynı mantıkta.

MODÜL 3 — KURYE İŞ İLANLARI

İki yönlü akış:

Mağaza/bayi tarafı: "Kurye Arıyorum" ilanı açar — çalışma şekli (tam zamanlı/yarı zamanlı/günlük), maaş/ücret aralığı, kendi motoru şartı var mı, bölge, vardiya saatleri, aranan nitelikler.

Kurye (bireysel kullanıcı) tarafı: İlanları filtreleyip görüntüler, tek tıkla başvuru yapar (CV/kısa özgeçmiş + mesaj), kendi profilinde deneyim, ehliyet sınıfı, çalışabileceği bölge ve müsaitlik bilgisi tutar.

Mağaza tarafı başvuranları görebileceği basit bir ATS benzeri liste görür (başvuru geldi / görüşülüyor / reddedildi / kabul edildi durumları).

Filtreler: şehir/bölge, çalışma şekli, ücret aralığı, kendi aracı olması şartı var mı/yok mu.

MODÜL 4 — SERVİS HARİTASI (Google Maps)

Google Maps JavaScript API ile harita gösterilecek, kullanıcının konumuna göre (veya elle girilen adrese göre) en yakın motor tamir servisleri işaretlenecek. Places API (New) searchNearby endpoint'i ile "motorcycle_repair" / ilgili place type araması yapılacak; ayrıca admin panelinden manuel olarak da servis noktası eklenebilecek (kendi veritabanımızdaki servisler + Google'dan çekilenler birleştirilecek).

Her servis noktası için: isim, adres, telefon, çalışma saatleri, hizmet türleri (genel bakım, lastik, elektrik, kaporta/boya vb.), yıldız/puan (varsa Google'dan, yoksa platform içi kullanıcı yorumları), "yol tarifi al" butonu (Google Maps'e yönlendirme), mesafe bilgisi (km).

Filtreler: hizmet türü, şu an açık olanlar, mesafeye göre sıralama.

Not: Google Maps API anahtarını ben kendim ekleyeceğim, sen .env içinde GOOGLE_MAPS_API_KEY değişkeni olarak bekleyecek şekilde kodu hazırla, hardcode etme.

ORTAK ÖZELLİKLER (tüm modüllerde)

Arama: Üst menüde global arama kutusu, modül bazlı arama sayfalarına yönlendirir

Filtreleme & Sıralama: Her listeleme sayfasında sol/üst panelde filtre, URL query parametreleriyle senkron (paylaşılabilir link)

Fotoğraf yükleme: Sürükle-bırak, çoklu yükleme, otomatik sıkıştırma/optimize etme

Favoriler: Kalp ikonuyla favorilere ekleme, /hesabim/favorilerde listeleme

Mesajlaşma: İlan üzerinden başlatılan basit bir inbox sistemi (real-time olması şart değil, ilk fazda polling/refresh yeterli)

Bildirimler: Yeni mesaj, ilan onaylandı/reddedildi, yeni başvuru gibi durumlarda in-app bildirim

Şikayet/Rapor: Her ilanda "şikayet et" seçeneği, admin paneline düşer

Öne çıkan ilan: Ücretli/admin onaylı öne çıkarma sistemi için altyapı (ödeme entegrasyonu ilk fazda opsiyonel, ama veri modeli buna hazır olsun)

TASARIM / UI-UX YÖNERGELERİ

Orta modernlikte: temiz kart tasarımları, yumuşak gölgeler, yuvarlatılmış köşeler (aşırı değil), bol boşluk ama sıkışık bilgiye de yer açan yoğunluk (ilan sitesi kullanıcısı çok bilgi görmeye alışkın)

Renk paleti: nötr bir taban (beyaz/açık gri) üzerine motosiklet temasına uygun güçlü bir vurgu rengi (örn. turuncu/kırmızı ya da koyu lacivert — kod yazarken bir palet öner, ben onaylarım)

Tipografi: okunabilir, modern bir sans-serif (Inter, Geist vb.)

Mobil öncelikli: filtreler mobilde alttan açılan sheet/drawer olarak

Karanlık mod desteği (opsiyonel ama varsa iyi olur)

Her modülün kendi ikon/renk vurgusu olsun ki kullanıcı hangi sekmede olduğunu hemen anlasın

VERİTABANI ŞEMASI (öneri — Prisma ile modelle)

User (id, ad, email, telefon, şifre_hash, rol[bireysel/magaza/admin], profil_foto, oluşturulma_tarihi)

DealerProfile (userId, işletme_adı, vergi_no, adres, çalışma_saatleri, doğrulanmış_mı)

MotorcycleListing (id, userId, marka, model, yıl, km, cc, vites, yakıt, renk, fiyat, takas, hasar_kaydı, kimden, açıklama, il, ilçe, durum[beklemede/onaylı/reddedildi/satıldı], görüntülenme, oluşturulma_tarihi)

PartListing (id, userId, kategori, alt_kategori, uyumlu_modeller[], durum, marka, fiyat, açıklama, il, ilçe, onay_durumu)

ListingPhoto (id, listingId, listingType, url, sıra)

CourierJob (id, dealerId, başlık, çalışma_şekli, ücret_min, ücret_max, kendi_aracı_şartı, bölge, açıklama, durum)

CourierApplication (id, jobId, userId, mesaj, durum[beklemede/görüşülüyor/reddedildi/kabul])

RepairShop (id, isim, adres, lat, lng, telefon, çalışma_saatleri, hizmet_türleri[], kaynak[manuel/google], google_place_id)

Favorite (id, userId, listingId, listingType)

Message (id, senderId, receiverId, listingId, içerik, okundu_mu, oluşturulma_tarihi)

Report (id, reporterId, listingId, sebep, durum)

GÜVENLİK & PERFORMANS

Tüm form girdilerinde Zod ile server-side validasyon

Rate limiting (ilan verme, mesaj gönderme gibi aksiyonlarda spam önleme)

Görsellerin optimize edilmesi (Next.js Image bileşeni)

SEO: ilan detay sayfaları için dinamik meta tag, sitemap.xml, ilan başlıklarına uygun slug yapısı (SSR/ISR ile hızlı ilk yükleme)

Rol bazlı erişim kontrolü (middleware ile /admin ve /hesabim korunması)

GELİŞTİRME AŞAMALARI (bu sırayla ilerle)

Proje iskeleti: Next.js + TypeScript + Tailwind + Prisma kurulumu, veritabanı şemasının oluşturulması

Auth sistemi ve kullanıcı rolleri (bireysel/mağaza/admin)

Motosiklet ilan modülü (CRUD + filtre + detay sayfası) — bunu tam bitir, çünkü diğer modüllerin çoğu bu patterni tekrar kullanacak

Yedek parça & aksesuar modülü (motosiklet modülündeki bileşenleri yeniden kullanarak)

Kurye iş ilanları modülü (ilan + başvuru akışı)

Servis haritası modülü (Google Maps entegrasyonu)

Ortak özellikler: favoriler, mesajlaşma, bildirimler, admin paneli

Mobil responsive ince ayar + PWA yapılandırması

SEO ve performans optimizasyonu

SON NOT

Kod yazarken açıklamaları Türkçe tut (kullanıcı arayüzü metinleri tamamen Türkçe olmalı), ama değişken/fonksiyon isimleri İngilizce kalabilir (endüstri standardı). Her aşamanın sonunda ne yaptığını kısaca özetle ki takip edebileyim. Emin olmadığın bir tasarım kararında (örn. renk paleti, kategori isimleri) varsayılan makul bir seçim yap ve bana belirt, durup sorma.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://moto-hub-tr.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/18dc5292-fd6d-47ec-a234-5ffb992738a0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
