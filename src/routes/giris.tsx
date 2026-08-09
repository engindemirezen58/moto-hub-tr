import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { signInSchema } from "@/lib/schemas";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [
      { title: "Giriş Yap | MotoHub Hesabınız" },
      {
        name: "description",
        content: "MotoHub hesabınıza giriş yaparak ilanlarınızı yönetin, mesajlarınıza ulaşın.",
      },
      { property: "og:title", content: "Giriş Yap - MotoHub" },
      { property: "og:description", content: "MotoHub hesabınıza giriş yapın." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error("E-posta veya şifre hatalı.");
      return;
    }
    toast.success("Hoş geldiniz!");
    void navigate({ to: "/hesabim" });
  };

  const googleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google ile giriş başarısız.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/hesabim" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="font-display text-3xl font-bold">Giriş Yap</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        İlan vermek, favorilere eklemek ve mesajlaşmak için giriş yapın.
      </p>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>

        <div className="relative py-1 text-center text-xs text-muted-foreground">
          <span className="bg-card px-2">veya</span>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={() => void googleSignIn()}>
          Google ile devam et
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link to="/kayit" className="font-medium text-primary underline">
            Üye olun
          </Link>
        </p>
      </form>
    </div>
  );
}
