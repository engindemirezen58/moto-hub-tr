import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploader } from "@/components/listing/PhotoUploader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uniqueSlug } from "@/lib/format";
import { motorcycleListingSchema } from "@/lib/schemas";
import {
  CITIES,
  ENGINE_TYPES,
  FUEL_TYPES,
  MOTO_BRANDS,
  SELLER_TYPES,
  TRANSMISSIONS,
} from "@/lib/constants";

export const Route = createFileRoute("/motosikletler/ilan-ver")({
  head: () => ({
    meta: [
      { title: "Ücretsiz Motosiklet İlanı Ver | MotoHub" },
      {
        name: "description",
        content:
          "Motosikletinizi dakikalar içinde ilana çıkarın: fotoğraf yükleyin, teknik bilgileri girin ve alıcılarla buluşun.",
      },
      { property: "og:title", content: "Motosiklet İlanı Ver - MotoHub" },
      { property: "og:description", content: "Motosikletinizi ücretsiz ilana çıkarın." },
    ],
  }),
  component: CreateMotorcycleListingPage,
});

function CreateMotorcycleListingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: String(new Date().getFullYear()),
    isNew: false,
    mileage: "0",
    engineCc: "",
    engineType: "",
    transmission: "manuel",
    fuelType: "Benzin",
    color: "",
    price: "",
    tradePossible: false,
    hasDamageRecord: false,
    sellerType: "sahibinden",
    description: "",
    city: "",
    district: "",
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">İlan vermek için giriş yapın</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          İlan verebilmek için ücretsiz bir MotoHub hesabına ihtiyacınız var.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link to="/giris">Giriş Yap</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/kayit">Üye Ol</Link>
          </Button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = motorcycleListingSchema.safeParse({
      ...form,
      year: form.year,
      mileage: form.isNew ? 0 : form.mileage,
      engineCc: form.engineCc,
      price: form.price,
      photos,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    const v = parsed.data;
    setSaving(true);
    const title = `${v.brand} ${v.model} ${v.year}${v.color ? " " + v.color : ""}`;
    const { error } = await supabase.from("motorcycle_listings").insert({
      user_id: user!.id,
      slug: uniqueSlug(title),
      title,
      brand: v.brand,
      model: v.model,
      year: v.year,
      mileage: v.mileage,
      engine_cc: v.engineCc,
      engine_type: v.engineType || null,
      transmission: v.transmission,
      fuel_type: v.fuelType,
      color: v.color || null,
      price: v.price,
      is_new: v.isNew,
      trade_possible: v.tradePossible,
      has_damage_record: v.hasDamageRecord,
      seller_type: v.sellerType,
      description: v.description || null,
      city: v.city,
      district: v.district || null,
      photos: v.photos,
    });
    setSaving(false);
    if (error) {
      toast.error("İlan kaydedilemedi. Lütfen tekrar deneyin.");
      return;
    }
    toast.success("İlanınız yayına alındı.");
    void navigate({ to: "/hesabim" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <span className="module-bar block w-10 text-moto" />
      <h1 className="mt-2 font-display text-3xl font-bold">Motosiklet İlanı Ver</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ne kadar çok bilgi girerseniz ilanınız o kadar hızlı alıcı bulur.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg font-bold">Fotoğraflar</h2>
          <PhotoUploader value={photos} onChange={setPhotos} />
        </section>

        <section className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">Araç Bilgileri</h2>

          <div className="space-y-2">
            <Label>Marka *</Label>
            <Select value={form.brand} onValueChange={(v) => set({ brand: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Marka seçin" />
              </SelectTrigger>
              <SelectContent>
                {MOTO_BRANDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model *</Label>
            <Input
              value={form.model}
              onChange={(e) => set({ model: e.target.value })}
              placeholder="Örn: MT-07"
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label>Üretim Yılı *</Label>
            <Input
              type="number"
              value={form.year}
              onChange={(e) => set({ year: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Kilometre *</Label>
            <Input
              type="number"
              value={form.isNew ? "0" : form.mileage}
              disabled={form.isNew}
              onChange={(e) => set({ mileage: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isNew}
                onCheckedChange={(v) => set({ isNew: !!v, mileage: v ? "0" : form.mileage })}
              />
              Sıfır (0 km)
            </label>
          </div>

          <div className="space-y-2">
            <Label>Silindir Hacmi (cc) *</Label>
            <Input
              type="number"
              value={form.engineCc}
              onChange={(e) => set({ engineCc: e.target.value })}
              placeholder="Örn: 689"
            />
          </div>

          <div className="space-y-2">
            <Label>Motor Tipi</Label>
            <Select value={form.engineType} onValueChange={(v) => set({ engineType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                {ENGINE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vites Tipi *</Label>
            <Select value={form.transmission} onValueChange={(v) => set({ transmission: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSMISSIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Yakıt Tipi *</Label>
            <Select value={form.fuelType} onValueChange={(v) => set({ fuelType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Renk</Label>
            <Input
              value={form.color}
              onChange={(e) => set({ color: e.target.value })}
              maxLength={40}
            />
          </div>

          <div className="space-y-2">
            <Label>Fiyat (₺) *</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
              placeholder="Örn: 385000"
            />
          </div>

          <div className="space-y-2">
            <Label>Kimden *</Label>
            <Select value={form.sellerType} onValueChange={(v) => set({ sellerType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SELLER_TYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.tradePossible}
                onCheckedChange={(v) => set({ tradePossible: !!v })}
              />
              Takasa açık
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.hasDamageRecord}
                onCheckedChange={(v) => set({ hasDamageRecord: !!v })}
              />
              Hasar kaydı var
            </label>
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">Konum ve Açıklama</h2>

          <div className="space-y-2">
            <Label>İl *</Label>
            <Select value={form.city} onValueChange={(v) => set({ city: v })}>
              <SelectTrigger>
                <SelectValue placeholder="İl seçin" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>İlçe</Label>
            <Input
              value={form.district}
              onChange={(e) => set({ district: e.target.value })}
              maxLength={60}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Açıklama</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={6}
              maxLength={4000}
              placeholder="Bakım geçmişi, eklenen aksesuarlar, kullanım şekli..."
            />
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? "Kaydediliyor..." : "İlanı Yayınla"}
        </Button>
      </form>
    </div>
  );
}
