// Uygulama genelinde kullanılan sabitler (UI'dan bağımsız, mobil uygulamada da
// yeniden kullanılabilir olması için ayrı tutuldu).

export const CITIES = [
  "Adana",
  "Ankara",
  "Antalya",
  "Aydın",
  "Balıkesir",
  "Bursa",
  "Denizli",
  "Diyarbakır",
  "Eskişehir",
  "Gaziantep",
  "Hatay",
  "İstanbul",
  "İzmir",
  "Kayseri",
  "Kocaeli",
  "Konya",
  "Malatya",
  "Manisa",
  "Mersin",
  "Muğla",
  "Sakarya",
  "Samsun",
  "Tekirdağ",
  "Trabzon",
  "Şanlıurfa",
] as const;

export const MOTO_BRANDS = [
  "Bajaj",
  "Benelli",
  "BMW",
  "CFMoto",
  "Ducati",
  "Harley-Davidson",
  "Honda",
  "Husqvarna",
  "Kawasaki",
  "KTM",
  "Kuba",
  "Mondial",
  "Piaggio",
  "RKS",
  "Royal Enfield",
  "Suzuki",
  "Triumph",
  "TVS",
  "Vespa",
  "Yamaha",
  "Diğer",
] as const;

export const FUEL_TYPES = ["Benzin", "Elektrik", "Hibrit"] as const;

export const ENGINE_TYPES = [
  "Tek Silindir",
  "Paralel Twin",
  "V-Twin",
  "Boxer",
  "Sıralı 3",
  "Sıralı 4",
  "Elektrikli",
] as const;

export const TRANSMISSIONS = [
  { value: "manuel", label: "Manuel" },
  { value: "otomatik", label: "Otomatik" },
  { value: "yari_otomatik", label: "Yarı Otomatik" },
] as const;

export const SELLER_TYPES = [
  { value: "sahibinden", label: "Sahibinden" },
  { value: "galeriden", label: "Galeriden" },
  { value: "yetkili_bayi", label: "Yetkili Bayiden" },
] as const;

export const CONDITIONS = [
  { value: "sifir", label: "Sıfır" },
  { value: "kullanilmis", label: "Kullanılmış" },
  { value: "yenilenmis", label: "Yenilenmiş" },
] as const;

export const WORK_TYPES = [
  { value: "tam_zamanli", label: "Tam Zamanlı" },
  { value: "yari_zamanli", label: "Yarı Zamanlı" },
  { value: "gunluk", label: "Günlük" },
] as const;

export const APPLICATION_STATUSES = [
  { value: "beklemede", label: "Beklemede" },
  { value: "gorusuluyor", label: "Görüşülüyor" },
  { value: "reddedildi", label: "Reddedildi" },
  { value: "kabul", label: "Kabul Edildi" },
] as const;

export const PART_CATEGORIES: Record<string, string[]> = {
  "Motor Parçaları": ["Piston & Segman", "Silindir", "Yağ Filtresi", "Zincir & Dişli", "Diğer"],
  "Fren Sistemi": ["Balata", "Disk", "Hidrolik", "Diğer"],
  "Lastik & Jant": ["Lastik", "Jant", "İç Lastik", "Diğer"],
  "Elektrik/Elektronik": ["Akü", "Far & Sinyal", "Beyin/ECU", "Kablo Tesisatı", "Diğer"],
  "Kaporta/Plastik Aksam": ["Grenaj", "Çamurluk", "Depo", "Sele", "Diğer"],
  Kask: ["Kapalı Kask", "Çene Açılır", "Açık Kask", "Cross Kask", "Vizör"],
  "Kıyafet & Koruyucu": ["Mont", "Pantolon", "Eldiven", "Bot", "Korumalar"],
  "Bagaj & Çanta": ["Yan Çanta", "Top Case", "Tank Çantası", "Diğer"],
  "Diğer Aksesuar": ["Telefon Tutucu", "Kamera", "Alarm", "Diğer"],
};

export const SERVICE_TYPES = [
  "Genel Bakım",
  "Lastik",
  "Elektrik",
  "Kaporta/Boya",
  "Yol Yardım",
  "Performans",
] as const;

export const SORT_OPTIONS = [
  { value: "yeni", label: "En Yeni" },
  { value: "fiyat_artan", label: "Fiyat (Artan)" },
  { value: "fiyat_azalan", label: "Fiyat (Azalan)" },
  { value: "populer", label: "En Çok Görüntülenen" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
