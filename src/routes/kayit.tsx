import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema } from "@/lib/schemas";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/kayit")({
  head: () => ({
    meta: [
      { title: "Ücretsiz Üye Ol | MotoHub" },
      {
        name: "description",
        content:
          "Bireysel ya da mağaza hesabı açın; motosiklet, parça ve kurye ilanlarınızı ücretsiz yayınlayın.",
      },
      { property: "og:title", content: "Üye Ol - MotoHub" },
      { property: "og:description", content: "MotoHub'a ücretsiz katılın." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    accountType: "bireysel" as "bireysel" | "magaza",
    businessName: "",
  });
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    const v = parsed.data;
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: v.fullName,
          phone: v.phone || null,
          account_type: v.accountType,
          business_name: v.businessName || null,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Bu e-posta zaten kayıtlı."
          : "Kayıt oluşturulamadı.",
      );
      return;
    }
    if (!data.session) {
      toast.success("Hesabınızı doğrulamak için e-postanızı kontrol edin.");
      return;
    }
    toast.success("Hesabınız oluşturuldu.");
    void navigate({ to: "/hesabim" });
  };

  const googleSignUp = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google ile kayıt başarısız.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/hesabim" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="font-display text-3xl font-bold">Üye Ol</h1>
      <p className="mb-6 text-sm text-muted-foreground">Ücretsiz hesap açın, ilan vermeye başlayın.</p>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="space-y-2">
          <Label>Hesap Türü</Label>
          <RadioGroup
            value={form.accountType}
            onValueChange={(v) => set({ accountType: v as "bireysel" | "magaza" })}
            className="grid grid-cols-2 gap-2"
          >
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm">
              <RadioGroupItem value="bireysel" /> Bireysel
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm">
              <RadioGroupItem value="magaza" /> Mağaza
            </label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => set({ fullName: e.target.value })}
            maxLength={100}
          />
        </div>

        {form.accountType === "magaza" && (
          <div className="space-y-2">
            <Label htmlFor="businessName">İşletme Adı</Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={(e) => set({ businessName: e.target.value })}
              maxLength={120}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon (opsiyonel)</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder="0555 123 45 67"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => set({ password: e.target.value })}
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Oluşturuluyor..." : "Hesap Oluştur"}
        </Button>

        <Button type="button" variant="outline" className="w-full" onClick={() => void googleSignUp()}>
          Google ile devam et
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Zaten üye misiniz?{" "}
          <Link to="/giris" className="font-medium text-primary underline">
            Giriş yapın
          </Link>
        </p>
      </form>
    </div>
  );
}
