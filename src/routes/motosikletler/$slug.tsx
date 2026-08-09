import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Eye, Flag, Gauge, MapPin, MessageSquare, Repeat, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { MotorcycleCard, type MotoCardData } from "@/components/listing/MotorcycleCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber, formatPrice, formatDate } from "@/lib/format";
import { SELLER_TYPES, TRANSMISSIONS } from "@/lib/constants";
import { messageSchema, reportSchema } from "@/lib/schemas";

export const Route = createFileRoute("/motosikletler/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} | Motosiklet İlanı - MotoHub` },
      {
        name: "description",
        content:
          "İlan detayları, teknik özellikler, fotoğraflar ve satıcı bilgileri. MotoHub üzerinden satıcıya hemen mesaj gönderin.",
      },
      { property: "og:title", content: "Motosiklet İlanı - MotoHub" },
      { property: "og:description", content: "İlan detayları ve teknik özellikler MotoHub'da." },
    ],
  }),
  component: MotorcycleDetailPage,
});

const REPORT_REASONS = [
  "Yanıltıcı bilgi",
  "Sahte ilan",
  "Yanlış kategori",
  "Uygunsuz içerik",
  "Diğer",
];

function MotorcycleDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [activePhoto, setActivePhoto] = useState(0);
  const [message, setMessage] = useState("");
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");

  const { data: listing, isLoading } = useQuery({
    queryKey: ["motorcycle", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motorcycle_listings")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: similar } = useQuery({
    queryKey: ["motorcycle-similar", listing?.brand, listing?.id],
    enabled: !!listing,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motorcycle_listings")
        .select(
          "id, slug, title, price, year, mileage, engine_cc, city, district, photos, is_featured, trade_possible, is_new, created_at",
        )
        .eq("status", "onayli")
        .eq("brand", listing!.brand)
        .neq("id", listing!.id)
        .limit(4);
      if (error) throw error;
      return data as MotoCardData[];
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground">Yükleniyor...</div>;
  }
  if (!listing) return null;

  const sendMessage = async () => {
    if (!user) {
      toast.error("Mesaj göndermek için giriş yapmalısınız.");
      return;
    }
    if (!listing.user_id) {
      toast.error("Bu ilan için mesajlaşma kapalı.");
      return;
    }
    const parsed = messageSchema.safeParse({ content: message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: listing.user_id,
      listing_id: listing.id,
      listing_type: "motorcycle",
      content: parsed.data.content,
    });
    if (error) {
      toast.error("Mesaj gönderilemedi.");
      return;
    }
    setMessage("");
    toast.success("Mesajınız satıcıya iletildi.");
  };

  const sendReport = async () => {
    if (!user) {
      toast.error("Şikayet için giriş yapmalısınız.");
      return;
    }
    const parsed = reportSchema.safeParse({ reason: reportReason, details: reportDetails });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz veri");
      return;
    }
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      listing_id: listing.id,
      listing_type: "motorcycle",
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
    });
    if (error) {
      toast.error("Şikayet gönderilemedi.");
      return;
    }
    setReportDetails("");
    toast.success("Şikayetiniz ekibimize iletildi.");
  };

  const specs: Array<[string, string]> = [
    ["Marka", listing.brand],
    ["Model", listing.model],
    ["Yıl", String(listing.year)],
    ["Kilometre", listing.is_new ? "Sıfır" : `${formatNumber(listing.mileage)} km`],
    ["Motor Hacmi", `${listing.engine_cc} cc`],
    ["Motor Tipi", listing.engine_type ?? "Belirtilmemiş"],
    ["Vites", TRANSMISSIONS.find((t) => t.value === listing.transmission)?.label ?? "-"],
    ["Yakıt", listing.fuel_type],
    ["Renk", listing.color ?? "Belirtilmemiş"],
    ["Takas", listing.trade_possible ? "Takasa açık" : "Takas yok"],
    ["Hasar Kaydı", listing.has_damage_record ? "Var" : "Yok"],
    ["Kimden", SELLER_TYPES.find((s) => s.value === listing.seller_type)?.label ?? "-"],
    ["Konum", `${listing.city}${listing.district ? " / " + listing.district : ""}`],
    ["İlan Tarihi", formatDate(listing.created_at)],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>{" "}
        /{" "}
        <Link to="/motosikletler" className="hover:text-foreground">
          Motosikletler
        </Link>{" "}
        / <span className="text-foreground">{listing.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <img
              src={listing.photos[activePhoto] ?? listing.photos[0]}
              alt={`${listing.title} - fotoğraf ${activePhoto + 1}`}
              className="aspect-16/10 w-full object-cover"
            />
            {listing.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {listing.photos.map((photo, index) => (
                  <button
                    key={photo}
                    onClick={() => setActivePhoto(index)}
                    className={`size-16 shrink-0 overflow-hidden rounded-md border-2 ${
                      index === activePhoto ? "border-primary" : "border-transparent"
                    }`}
                    aria-label={`Fotoğraf ${index + 1}`}
                  >
                    <img src={photo} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-4 font-display text-xl font-bold">Teknik Özellikler</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between border-b border-border py-2 text-sm last:border-0"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {listing.description && (
            <section className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="mb-3 font-display text-xl font-bold">Açıklama</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-foreground/90">
                {listing.description}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <h1 className="font-display text-2xl font-bold leading-tight">{listing.title}</h1>
                <FavoriteButton listingId={listing.id} listingType="motorcycle" />
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {listing.is_new && <Badge variant="secondary">Sıfır</Badge>}
                {listing.trade_possible && (
                  <Badge variant="secondary" className="gap-1">
                    <Repeat className="size-3" /> Takaslı
                  </Badge>
                )}
                {listing.has_damage_record && (
                  <Badge variant="destructive" className="gap-1">
                    <ShieldAlert className="size-3" /> Hasar kaydı var
                  </Badge>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="rounded-lg bg-muted p-2">
                  <Calendar className="mx-auto mb-1 size-4" />
                  {listing.year}
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <Gauge className="mx-auto mb-1 size-4" />
                  {formatNumber(listing.mileage)} km
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <Eye className="mx-auto mb-1 size-4" />
                  {formatNumber(listing.view_count)}
                </div>
              </div>

              <p className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {listing.city}
                {listing.district ? ` / ${listing.district}` : ""}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                <MessageSquare className="size-4" /> Satıcıya Mesaj Gönder
              </h2>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Merhaba, ilanınız hâlâ geçerli mi?"
                maxLength={2000}
                rows={4}
              />
              <Button className="mt-3 w-full" onClick={() => void sendMessage()}>
                Mesaj Gönder
              </Button>
              {!user && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  <Link to="/giris" className="underline">
                    Giriş yapın
                  </Link>{" "}
                  ya da{" "}
                  <Link to="/kayit" className="underline">
                    üye olun
                  </Link>
                </p>
              )}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Flag className="size-3.5" /> Bu ilanı şikayet et
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>İlanı Şikayet Et</DialogTitle>
                  <DialogDescription>
                    Şikayetiniz moderasyon ekibimize iletilir ve incelenir.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    aria-label="Şikayet sebebi"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Detay (opsiyonel)"
                    maxLength={1000}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={() => void sendReport()}>Gönder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </aside>
      </div>

      {similar && similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-bold">Benzer İlanlar</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {similar.map((item) => (
              <MotorcycleCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
