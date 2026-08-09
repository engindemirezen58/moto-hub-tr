import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { partListingSchema } from "@/lib/schemas";
import { CITIES, CONDITIONS, PART_CATEGORIES } from "@/lib/constants";

export const Route = createFileRoute("/parca-aksesuar/ilan-ver")({
  head: () => ({
    meta: [
      { title: "Yedek Parça İlanı Ver | MotoHub" },
      {
        name: "description",
        content:
          "Elinizdeki motosiklet parçasını veya aksesuarını ücretsiz ilana çıkarın; uyumlu modelleri belirtin, hızlıca satın.",
      },
      { property: "og:title", content: "Parça İlanı Ver - MotoHub" },
      { property: "og:description", content: "Parça ve aksesuarınızı ücretsiz ilana çıkarın." },
    ],
  }),
  component: CreatePartListingPage,
});

function CreatePartListingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState("");
  const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    subcategory: "",
    condition: "kullanilmis",
    brand: "",
    price: "",
    description: "",
    city: "",
    district: "",
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">İlan vermek için giriş yapın</h1>
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

  const addModel = () => {
    const value = modelInput.trim();
    if (!value || compatibleModels.includes(value) || compatibleModels.length >= 20) return;
    setCompatibleModels((m) => [...m, value]);
    setModelInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = partListingSchema.safeParse({ ...form, compatibleModels, photos });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    const v = parsed.data;
    setSaving(true);
    const { error } = await supabase.from("part_listings").insert({
      user_id: user!.id,
      slug: uniqueSlug(v.title),
      title: v.title,
      category: v.category,
      subcategory: v.subcategory || null,
      compatible_models: v.compatibleModels,
      condition: v.condition,
      brand: v.brand || null,
      price: v.price,
      description: v.description || null,
      city: v.city,
      district: v.district || null,
      photos: v.photos,
    });
    setSaving(false);
    if (error) {
      toast.error("İlan kaydedilemedi.");
      return;
    }
    toast.success("İlanınız yayına alındı.");
    void navigate({ to: "/hesabim" });
  };

  const subcategories = form.category ? (PART_CATEGORIES[form.category] ?? []) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <span className="module-bar block w-10 text-parca" />
      <h1 className="mt-2 font-display text-3xl font-bold">Parça / Aksesuar İlanı Ver</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Uyumlu modelleri eklemek ilanınızın doğru alıcıya ulaşmasını sağlar.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg font-bold">Fotoğraflar</h2>
          <PhotoUploader value={photos} onChange={setPhotos} />
        </section>

        <section className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">Ürün Bilgileri</h2>

          <div className="space-y-2 sm:col-span-2">
            <Label>İlan Başlığı *</Label>
            <Input
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Örn: Akrapovic Slip-on Egzoz"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label>Kategori *</Label>
            <Select
              value={form.category}
              onValueChange={(v) => set({ category: v, subcategory: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(PART_CATEGORIES).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Alt Kategori</Label>
            <Select
              value={form.subcategory}
              onValueChange={(v) => set({ subcategory: v })}
              disabled={subcategories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçin" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Durum *</Label>
            <Select value={form.condition} onValueChange={(v) => set({ condition: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marka</Label>
            <Input
              value={form.brand}
              onChange={(e) => set({ brand: e.target.value })}
              maxLength={60}
              placeholder="Örn: Akrapovic"
            />
          </div>

          <div className="space-y-2">
            <Label>Fiyat (₺) *</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Uyumlu Modeller</Label>
            <div className="flex gap-2">
              <Input
                value={modelInput}
                onChange={(e) => setModelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addModel();
                  }
                }}
                placeholder="Örn: Yamaha MT-07 2018+"
                maxLength={60}
              />
              <Button type="button" variant="outline" onClick={addModel}>
                Ekle
              </Button>
            </div>
            {compatibleModels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {compatibleModels.map((m) => (
                  <Badge key={m} variant="secondary" className="gap-1">
                    {m}
                    <button
                      type="button"
                      onClick={() => setCompatibleModels((list) => list.filter((x) => x !== m))}
                      aria-label={`${m} kaldır`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
