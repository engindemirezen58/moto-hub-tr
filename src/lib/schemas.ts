import { z } from "zod";

// Tüm form doğrulamaları burada. UI'dan bağımsız; ileride mobil uygulama ve
// API katmanı aynı şemaları kullanabilir.

export const emailSchema = z.string().trim().email("Geçerli bir e-posta girin").max(255);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Şifre en az 6 karakter olmalı").max(72),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Ad soyad en az 2 karakter").max(100),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^[0-9\s()+-]{10,20}$/, "Geçerli bir telefon numarası girin")
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı").max(72),
  accountType: z.enum(["bireysel", "magaza"]),
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
});

export const motorcycleListingSchema = z.object({
  brand: z.string().trim().min(1, "Marka seçin"),
  model: z.string().trim().min(1, "Model girin").max(80),
  year: z.coerce.number().int().min(1950, "Geçerli bir yıl girin").max(new Date().getFullYear() + 1),
  isNew: z.boolean().default(false),
  mileage: z.coerce.number().int().min(0, "Kilometre 0'dan küçük olamaz").max(1_000_000),
  engineCc: z.coerce.number().int().min(0).max(3000),
  powerRange: z.string().trim().min(1, "Motor gücü aralığı seçin").max(40),
  timingType: z.string().trim().max(40).optional().or(z.literal("")),
  coolingType: z.string().trim().max(40).optional().or(z.literal("")),
  engineType: z.string().trim().max(60).optional().or(z.literal("")),
  transmission: z.enum(["manuel", "otomatik", "yari_otomatik"]),
  fuelType: z.string().trim().min(1).max(30),
  color: z.string().trim().min(1, "Renk seçin").max(40),
  price: z.coerce.number().min(1, "Fiyat girin").max(100_000_000),
  tradePossible: z.boolean().default(false),
  hasDamageRecord: z.boolean().default(false),
  hasHeavyDamage: z.boolean().default(false),
  plateOrigin: z.string().trim().min(1, "Plaka/uyruk seçin").max(30),
  plateNumber: z
    .string()
    .trim()
    .min(5, "Araç plakasını girin")
    .max(15, "Plaka en fazla 15 karakter")
    .regex(/^[A-Z0-9ÇĞİÖŞÜ\s-]+$/i, "Geçerli bir plaka girin"),
  negotiable: z.boolean().default(true),
  contactPreference: z.enum(["uygulama", "uygulama_telefon"]).default("uygulama"),
  sellerType: z.enum(["sahibinden", "galeriden", "yetkili_bayi"]),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  city: z.string().trim().min(1, "İl seçin"),
  district: z.string().trim().max(60).optional().or(z.literal("")),
  photos: z.array(z.string().min(1)).min(1, "En az 1 fotoğraf ekleyin").max(15, "En fazla 15 fotoğraf"),
});


export const partListingSchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter").max(120),
  category: z.string().trim().min(1, "Kategori seçin"),
  subcategory: z.string().trim().max(60).optional().or(z.literal("")),
  compatibleModels: z.array(z.string().trim().max(60)).max(20).default([]),
  condition: z.enum(["sifir", "kullanilmis", "yenilenmis"]),
  brand: z.string().trim().max(60).optional().or(z.literal("")),
  price: z.coerce.number().min(1, "Fiyat girin").max(10_000_000),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  city: z.string().trim().min(1, "İl seçin"),
  district: z.string().trim().max(60).optional().or(z.literal("")),
  photos: z.array(z.string().min(1)).min(1, "En az 1 fotoğraf ekleyin").max(15),
});

export const courierJobSchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter").max(120),
  companyName: z.string().trim().min(2, "İşletme adı girin").max(120),
  workType: z.enum(["tam_zamanli", "yari_zamanli", "gunluk"]),
  salaryMin: z.coerce.number().min(0).max(1_000_000).optional(),
  salaryMax: z.coerce.number().min(0).max(1_000_000).optional(),
  requiresOwnBike: z.boolean().default(false),
  city: z.string().trim().min(1, "İl seçin"),
  district: z.string().trim().max(60).optional().or(z.literal("")),
  region: z.string().trim().max(60).optional().or(z.literal("")),
  shiftHours: z.string().trim().max(60).optional().or(z.literal("")),
  requirements: z.string().trim().max(1000).optional().or(z.literal("")),
  description: z.string().trim().min(10, "Açıklama en az 10 karakter").max(4000),
});

export const courierApplicationSchema = z.object({
  message: z.string().trim().min(10, "Kısa bir mesaj yazın").max(1500),
  experience: z.string().trim().max(500).optional().or(z.literal("")),
  licenseClass: z.string().trim().max(20).optional().or(z.literal("")),
});

export const messageSchema = z.object({
  content: z.string().trim().min(1, "Mesaj boş olamaz").max(2000),
});

export const reportSchema = z.object({
  reason: z.string().trim().min(1, "Sebep seçin").max(120),
  details: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type MotorcycleListingInput = z.infer<typeof motorcycleListingSchema>;
export type PartListingInput = z.infer<typeof partListingSchema>;
export type CourierJobInput = z.infer<typeof courierJobSchema>;
export type CourierApplicationInput = z.infer<typeof courierApplicationSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
