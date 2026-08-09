import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bike, Building2, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatPrice } from "@/lib/format";
import { WORK_TYPES } from "@/lib/constants";
import { courierApplicationSchema } from "@/lib/schemas";

export const Route = createFileRoute("/kurye-ilanlari/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} | Kurye İş İlanı - MotoHub` },
      {
        name: "description",
        content: "İş tanımı, maaş aralığı, çalışma saatleri ve başvuru formu MotoHub'da.",
      },
      { property: "og:title", content: "Kurye İş İlanı - MotoHub" },
      { property: "og:description", content: "İlan detayları ve online başvuru." },
    ],
  }),
  component: JobDetailPage,
});

function JobDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [experience, setExperience] = useState("");
  const [licenseClass, setLicenseClass] = useState("");
  const [sending, setSending] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_jobs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">Yükleniyor...</div>;
  }
  if (!job) return null;

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Başvuru için giriş yapmalısınız.");
      return;
    }
    const parsed = courierApplicationSchema.safeParse({ message, experience, licenseClass });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("courier_applications").insert({
      job_id: job.id,
      user_id: user.id,
      message: parsed.data.message,
      experience: parsed.data.experience || null,
      license_class: parsed.data.licenseClass || null,
    });
    setSending(false);
    if (error) {
      toast.error(
        error.code === "23505" ? "Bu ilana zaten başvurdunuz." : "Başvuru gönderilemedi.",
      );
      return;
    }
    setMessage("");
    toast.success("Başvurunuz işverene iletildi.");
  };

  const salary =
    job.salary_min || job.salary_max
      ? `${job.salary_min ? formatPrice(job.salary_min) : ""}${job.salary_min && job.salary_max ? " - " : ""}${job.salary_max ? formatPrice(job.salary_max) : ""}`
      : "Belirtilmemiş";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>{" "}
        /{" "}
        <Link to="/kurye-ilanlari" className="hover:text-foreground">
          Kurye İlanları
        </Link>{" "}
        / <span className="text-foreground">{job.title}</span>
      </nav>

      <header className="rounded-xl border border-border bg-card p-6 shadow-card">
        <span className="module-bar block w-10 text-kurye" />
        <h1 className="mt-2 font-display text-3xl font-bold">{job.title}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="size-4" /> {job.company_name}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">
            {WORK_TYPES.find((w) => w.value === job.work_type)?.label ?? job.work_type}
          </Badge>
          {job.requires_own_bike && (
            <Badge variant="outline" className="gap-1">
              <Bike className="size-3" /> Kendi motoru olmalı
            </Badge>
          )}
          {job.shift_hours && (
            <Badge variant="outline" className="gap-1">
              <Clock className="size-3" /> {job.shift_hours}
            </Badge>
          )}
        </div>

        <dl className="mt-5 grid gap-x-8 sm:grid-cols-2">
          {(
            [
              ["Maaş", salary],
              ["Konum", `${job.city}${job.district ? " / " + job.district : ""}`],
              ["Bölge", job.region ?? "-"],
              ["İlan Tarihi", formatDate(job.created_at)],
            ] as Array<[string, string]>
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between border-b border-border py-2 text-sm last:border-0"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-3 font-display text-xl font-bold">İş Tanımı</h2>
        <p className="whitespace-pre-line text-sm leading-6 text-foreground/90">{job.description}</p>
        {job.requirements && (
          <>
            <h3 className="mb-2 mt-5 font-display text-lg font-bold">Aranan Nitelikler</h3>
            <p className="whitespace-pre-line text-sm leading-6 text-foreground/90">
              {job.requirements}
            </p>
          </>
        )}
        <p className="mt-5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4" /> {job.city}
          {job.district ? ` / ${job.district}` : ""}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-xl font-bold">Bu İlana Başvur</h2>
        <form onSubmit={apply} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Deneyiminiz</Label>
              <Input
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Örn: 3 yıl motokurye"
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label>Ehliyet Sınıfı</Label>
              <Input
                value={licenseClass}
                onChange={(e) => setLicenseClass(e.target.value)}
                placeholder="Örn: A2"
                maxLength={20}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ön Yazı *</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={1500}
              placeholder="Kendinizden kısaca bahsedin."
            />
          </div>
          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </Button>
          {!user && (
            <p className="text-xs text-muted-foreground">
              Başvurmak için{" "}
              <Link to="/giris" className="underline">
                giriş yapın
              </Link>
              .
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
