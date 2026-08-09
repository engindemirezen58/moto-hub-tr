import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Phone, Star, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES, SERVICE_TYPES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/servisler/")({
  head: () => ({
    meta: [
      { title: "Motosiklet Servisleri ve Tamirciler | MotoHub Servis Rehberi" },
      {
        name: "description",
        content:
          "Şehrinizdeki motosiklet servisleri, yetkili bayiler, lastikçiler ve yol yardımı hizmetleri; adres, telefon ve puanlarıyla.",
      },
      { property: "og:title", content: "Servis Rehberi - MotoHub" },
      { property: "og:description", content: "Size en yakın motosiklet servislerini bulun." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [city, setCity] = useState<string>("hepsi");
  const [type, setType] = useState<string>("hepsi");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["shops", city, type, q],
    queryFn: async () => {
      let query = supabase.from("repair_shops").select("*").eq("is_approved", true);
      if (city !== "hepsi") query = query.eq("city", city);
      if (type !== "hepsi") query = query.contains("service_types", [type]);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data, error } = await query.order("rating", { ascending: false }).limit(60);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <span className="module-bar block w-10 text-servis" />
      <h1 className="mt-2 font-display text-3xl font-bold">Servis Rehberi</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Motosiklet servisleri, yetkili bayiler, lastikçiler ve yol yardımı.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Servis adı ara"
          maxLength={80}
          aria-label="Servis ara"
        />
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue placeholder="Tüm iller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Tüm iller</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Tüm hizmetler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Tüm hizmetler</SelectItem>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Yükleniyor...</p>}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((shop) => (
          <article
            key={shop.id}
            className="card-hover rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-bold leading-tight">{shop.name}</h2>
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                <Star className="size-4 fill-servis text-servis" />
                {Number(shop.rating).toFixed(1)}
              </span>
            </div>

            <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>
                {shop.address}
                <br />
                {shop.city}
                {shop.district ? ` / ${shop.district}` : ""}
              </span>
            </p>

            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                <Phone className="size-4" /> {shop.phone}
              </a>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(shop.service_types as string[]).map((s) => (
                <Badge key={s} variant="secondary" className="gap-1">
                  <Wrench className="size-3" /> {s}
                </Badge>
              ))}
            </div>

            {shop.working_hours && (
              <p className="mt-3 text-xs text-muted-foreground">{shop.working_hours}</p>
            )}
          </article>
        ))}
      </div>

      {data && data.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Bu kriterlere uygun servis bulunamadı.
        </p>
      )}
    </div>
  );
}
