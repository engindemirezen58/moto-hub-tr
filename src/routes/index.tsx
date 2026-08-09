import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bike, Package, Wrench, MapPin, Search, ShieldCheck, Zap, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MotorcycleCard, type MotoCardData } from "@/components/listing/MotorcycleCard";
import { PartCard, type PartCardData } from "@/components/listing/PartCard";
import { CourierJobCard, type JobCardData } from "@/components/listing/CourierJobCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MotoHub | Motosiklet İlanları, Yedek Parça ve Kurye İşleri" },
      {
        name: "description",
        content:
          "2. el ve sıfır motosiklet ilanları, yedek parça & aksesuar, kurye iş ilanları ve en yakın motor servisleri MotoHub'da.",
      },
      { property: "og:title", content: "MotoHub | Motosiklet Platformu" },
      {
        property: "og:description",
        content: "Motosiklet ekosisteminin tamamı tek bir platformda: ilan, parça, kurye, servis.",
      },
    ],
  }),
  component: HomePage,
});

const MODULE_CARDS = [
  {
    to: "/motosikletler",
    title: "Motosiklet İlanları",
    desc: "2. el ve sıfır motosikletler",
    icon: Bike,
    className: "bg-moto/10 text-moto",
  },
  {
    to: "/parca-aksesuar",
    title: "Yedek Parça & Aksesuar",
    desc: "Parça, lastik, kask, kıyafet",
    icon: Package,
    className: "bg-parca/10 text-parca",
  },
  {
    to: "/kurye-ilanlari",
    title: "Kurye İş İlanları",
    desc: "İş arayan ve kurye arayanlar",
    icon: Wrench,
    className: "bg-kurye/10 text-kurye",
  },
  {
    to: "/servisler",
    title: "Servis Haritası",
    desc: "En yakın motor tamircileri",
    icon: MapPin,
    className: "bg-servis/10 text-servis",
  },
] as const;

function HomePage() {
  const [query, setQuery] = useState("");

  const { data: motorcycles } = useQuery({
    queryKey: ["home", "motorcycles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("motorcycle_listings")
        .select(
          "id, slug, title, price, year, mileage, engine_cc, city, district, photos, is_featured, trade_possible, is_new, created_at",
        )
        .eq("status", "onayli")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as MotoCardData[];
    },
  });

  const { data: parts } = useQuery({
    queryKey: ["home", "parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_listings")
        .select(
          "id, slug, title, category, condition, brand, price, city, district, photos, is_featured, created_at",
        )
        .eq("status", "onayli")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data as PartCardData[];
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ["home", "jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courier_jobs")
        .select(
          "id, slug, title, company_name, work_type, salary_min, salary_max, requires_own_bike, city, district, shift_hours, created_at",
        )
        .eq("status", "onayli")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as JobCardData[];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1920&q=70)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Motosiklet dünyasının tamamı tek bir platformda
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-foreground/80 sm:text-base">
            İkinci el ve sıfır motosiklet ilanları, yedek parça & aksesuar, kurye iş ilanları ve
            çevrenizdeki motor servisleri.
          </p>

          <form
            className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Örn: Yamaha MT-07"
                maxLength={80}
                className="h-11 bg-surface pl-9 text-foreground"
                aria-label="Motosiklet ara"
              />
            </div>
            <Button asChild size="lg" className="h-11">
              <Link to="/motosikletler" search={query.trim() ? { q: query.trim() } : {}}>
                İlanlarda Ara
              </Link>
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-foreground/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Doğrulanmış mağaza rozetleri
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="size-4" /> Hızlı ilan verme
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" /> Kurye istihdam ağı
            </span>
          </div>
        </div>
      </section>

      {/* Modüller */}
      <section className="mx-auto -mt-8 max-w-7xl px-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODULE_CARDS.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="card-hover flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <span className={`grid size-11 shrink-0 place-items-center rounded-lg ${m.className}`}>
                <m.icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{m.title}</span>
                <span className="block text-xs text-muted-foreground">{m.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne çıkan motosikletler */}
      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <span className="module-bar block w-10 text-moto" />
            <h2 className="mt-2 font-display text-2xl font-bold">Öne Çıkan Motosikletler</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/motosikletler">Tümünü Gör</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {motorcycles?.map((listing) => <MotorcycleCard key={listing.id} listing={listing} />)}
        </div>
      </section>

      {/* Parça & aksesuar */}
      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <span className="module-bar block w-10 text-parca" />
            <h2 className="mt-2 font-display text-2xl font-bold">Yeni Parça & Aksesuar</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/parca-aksesuar">Tümünü Gör</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {parts?.map((listing) => <PartCard key={listing.id} listing={listing} />)}
        </div>
      </section>

      {/* Kurye ilanları */}
      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <span className="module-bar block w-10 text-kurye" />
            <h2 className="mt-2 font-display text-2xl font-bold">Güncel Kurye İlanları</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/kurye-ilanlari">Tümünü Gör</Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {jobs?.map((job) => <CourierJobCard key={job.id} job={job} />)}
        </div>
      </section>
    </div>
  );
}
