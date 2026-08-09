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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { uniqueSlug } from "@/lib/format";
import { courierJobSchema } from "@/lib/schemas";
import { CITIES, WORK_TYPES } from "@/lib/constants";

export const Route = createFileRoute("/kurye-ilanlari/ilan-ver")({
  head: () => ({
    meta: [
      { title: "Kurye İş İlanı Ver | MotoHub" },
      {
        name: "description",
        content:
          "İşletmeniz için motokurye arıyorsanız ücretsiz iş ilanı yayınlayın, başvuruları tek panelden yönetin.",
      },
      { property: "og:title", content: "Kurye İş İlanı Ver - MotoHub" },
      { property: "og:description", content: "İşletmeniz için ücretsiz kurye ilanı yayınlayın." },
    ],
  }),
  component: CreateJobPage,
});

function CreateJobPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    companyName: "",
    workType: "tam_zamanli",
    salaryMin: "",
    salaryMax: "",
    requiresOwnBike: false,
    city: "",
    district: "",
    region: "",
    shiftHours: "",
    requirements: "",
    description: "",
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = courierJobSchema.safeParse({
      ...form,
      salaryMin: form.salaryMin || undefined,
      salaryMax: form.salaryMax || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    const v = parsed.data;
    setSaving(true);
    const { error } = await supabase.from("courier_jobs").insert({
      user_id: user!.id,
      slug: uniqueSlug(`${v.companyName} ${v.title}`),
      title: v.title,
      company_name: v.companyName,
      work_type: v.workType,
      salary_min: v.salaryMin ?? null,
      salary_max: v.salaryMax ?? null,
      requires_own_bike: v.requiresOwnBike,
      city: v.city,
      district: v.district || null,
      region: v.region || null,
      shift_hours: v.shiftHours || null,
      requirements: v.requirements || null,
      description: v.description,
    });
    setSaving(false);
    if (error) {
      toast.error("İlan kaydedilemedi.");
      return;
    }
    toast.success("İş ilanınız yayına alındı.");
    void navigate({ to: "/hesabim" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <span className="module-bar block w-10 text-kurye" />
      <h1 className="mt-2 font-display text-3xl font-bold">Kurye İş İlanı Ver</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Net maaş aralığı ve çalışma saatleri yazan ilanlar 3 kat daha fazla başvuru alır.
      </p>

      <form onSubmit={submit} className="space-y-6">
        <section className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">İlan Bilgileri</h2>

          <div className="space-y-2">
            <Label>İlan Başlığı *</Label>
            <Input
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Örn: Motokurye Aranıyor"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label>İşletme Adı *</Label>
            <Input
              value={form.companyName}
              onChange={(e) => set({ companyName: e.target.value })}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label>Çalışma Şekli *</Label>
            <Select value={form.workType} onValueChange={(v) => set({ workType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vardiya Saatleri</Label>
            <Input
              value={form.shiftHours}
              onChange={(e) => set({ shiftHours: e.target.value })}
              placeholder="Örn: 10:00 - 22:00"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label>Maaş (min ₺)</Label>
            <Input
              type="number"
              value={form.salaryMin}
              onChange={(e) => set({ salaryMin: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Maaş (max ₺)</Label>
            <Input
              type="number"
              value={form.salaryMax}
              onChange={(e) => set({ salaryMax: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <Checkbox
              checked={form.requiresOwnBike}
              onCheckedChange={(v) => set({ requiresOwnBike: !!v })}
            />
            Adayın kendi motosikleti olmalı
          </label>
        </section>

        <section className="grid gap-4 rounded-xl border border-border bg-card p-5 shadow-card sm:grid-cols-2">
          <h2 className="font-display text-lg font-bold sm:col-span-2">Konum ve Detaylar</h2>

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
            <Label>Çalışma Bölgesi</Label>
            <Input
              value={form.region}
              onChange={(e) => set({ region: e.target.value })}
              placeholder="Örn: Kadıköy ve çevresi"
              maxLength={60}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>İş Tanımı *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={6}
              maxLength={4000}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Aranan Nitelikler</Label>
            <Textarea
              value={form.requirements}
              onChange={(e) => set({ requirements: e.target.value })}
              rows={4}
              maxLength={1000}
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
