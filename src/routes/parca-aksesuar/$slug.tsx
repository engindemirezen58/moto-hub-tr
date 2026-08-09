import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, MessageSquare, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { PartCard, type PartCardData } from "@/components/listing/PartCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatDate } from "@/lib/format";
import { CONDITIONS } from "@/lib/constants";
import { messageSchema } from "@/lib/schemas";

export const Route = createFileRoute("/parca-aksesuar/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} | Yedek Parça İlanı - MotoHub` },
      {
        name: "description",
        content: "Parça detayları, uyumlu modeller, fiyat ve satıcı bilgileri MotoHub'da.",
      },
      { property: "og:title", content: "Yedek Parça İlanı - MotoHub" },
      { property: "og:description", content: "Parça detayları ve uyumlu modeller." },
    ],
  }),
  component: PartDetailPage,
});

function PartDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [activePhoto, setActivePhoto] = useState(0);
  const [message, setMessage] = useState("");

  const { data: listing, isLoading } = useQuery({
    queryKey: ["part", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_listings")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const { data: similar } = useQuery({
    queryKey: ["part-similar", listing?.category, listing?.id],
    enabled: !!listing,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_listings")
        .select(
          "id, slug, title, category, condition, brand, price, city, district, photos, is_featured, created_at",
        )
        .eq("status", "onayli")
        .eq("category", listing!.category)
        .neq("id", listing!.id)
        .limit(4);
      if (error) throw error;
      return data as PartCardData[];
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
      toast.error(parsed.error.issues[0]?.message ?? "Geçersiz mesaj");
      return;
    }
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: listing.user_id,
      listing_id: listing.id,
      listing_type: "part",
      content: parsed.data.content,
    });
    if (error) {
      toast.error("Mesaj gönderilemedi.");
      return;
    }
    setMessage("");
    toast.success("Mesajınız satıcıya iletildi.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>{" "}
        /{" "}
        <Link to="/parca-aksesuar" className="hover:text-foreground">
          Parça & Aksesuar
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
            <h2 className="mb-4 font-display text-xl font-bold">Ürün Bilgileri</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {(
                [
                  ["Kategori", listing.category],
                  ["Alt Kategori", listing.subcategory ?? "-"],
                  ["Marka", listing.brand ?? "Belirtilmemiş"],
                  [
                    "Durum",
                    CONDITIONS.find((c) => c.value === listing.condition)?.label ?? listing.condition,
                  ],
                  ["Konum", `${listing.city}${listing.district ? " / " + listing.district : ""}`],
                  ["İlan Tarihi", formatDate(listing.created_at)],
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

            {listing.compatible_models.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Uyumlu Modeller</p>
                <div className="flex flex-wrap gap-1.5">
                  {listing.compatible_models.map((model: string) => (
                    <Badge key={model} variant="secondary">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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

        <aside>
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <h1 className="font-display text-2xl font-bold leading-tight">{listing.title}</h1>
                <FavoriteButton listingId={listing.id} listingType="part" />
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Package className="size-3" /> {listing.category}
                </Badge>
                <Badge variant="outline">
                  {CONDITIONS.find((c) => c.value === listing.condition)?.label}
                </Badge>
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
                placeholder="Ürün hâlâ mevcut mu?"
                rows={4}
                maxLength={2000}
              />
              <Button className="mt-3 w-full" onClick={() => void sendMessage()}>
                Mesaj Gönder
              </Button>
              {!user && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  <Link to="/giris" className="underline">
                    Giriş yapın
                  </Link>
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {similar && similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-bold">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {similar.map((item) => (
              <PartCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
