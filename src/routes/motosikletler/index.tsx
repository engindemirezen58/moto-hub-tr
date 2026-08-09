import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Filter, Plus, SlidersHorizontal } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MotorcycleCard, type MotoCardData } from "@/components/listing/MotorcycleCard";
import { CITIES, MOTO_BRANDS, SORT_OPTIONS, TRANSMISSIONS, SELLER_TYPES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  q: z.string().optional(),
  brand: z.string().optional(),
  city: z.string().optional(),
  minYear: z.coerce.number().optional(),
  maxYear: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  maxKm: z.coerce.number().optional(),
  minCc: z.coerce.number().optional(),
  maxCc: z.coerce.number().optional(),
  transmission: z.string().optional(),
  sellerType: z.string().optional(),
  trade: z.boolean().optional(),
  noDamage: z.boolean().optional(),
  sort: z.string().optional(),
});

export type MotoSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/motosikletler/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Motosiklet İlanları | 2. El ve Sıfır Motosikletler - MotoHub" },
      {
        name: "description",
        content:
          "Marka, model, yıl, kilometre ve fiyata göre filtreleyerek binlerce 2. el ve sıfır motosiklet ilanı arasından size uygun olanı bulun.",
      },
      { property: "og:title", content: "Motosiklet İlanları - MotoHub" },
      {
        property: "og:description",
        content: "2. el ve sıfır motosiklet ilanlarını filtreleyin, karşılaştırın, iletişime geçin.",
      },
    ],
  }),
  component: MotorcycleListPage,
});

function MotorcycleListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/motosikletler" });

  const setFilter = (patch: Partial<MotoSearch>) => {
    void navigate({ search: (prev: MotoSearch) => ({ ...prev, ...patch }) });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["motorcycles", search],
    queryFn: async () => {
      let query = supabase
        .from("motorcycle_listings")
        .select(
          "id, slug, title, price, year, mileage, engine_cc, city, district, photos, is_featured, trade_possible, is_new, created_at",
        )
        .eq("status", "onayli");

      if (search.q) query = query.ilike("title", `%${search.q}%`);
      if (search.brand) query = query.eq("brand", search.brand);
      if (search.city) query = query.eq("city", search.city);
      if (search.minYear) query = query.gte("year", search.minYear);
      if (search.maxYear) query = query.lte("year", search.maxYear);
      if (search.minPrice) query = query.gte("price", search.minPrice);
      if (search.maxPrice) query = query.lte("price", search.maxPrice);
      if (search.maxKm) query = query.lte("mileage", search.maxKm);
      if (search.minCc) query = query.gte("engine_cc", search.minCc);
      if (search.maxCc) query = query.lte("engine_cc", search.maxCc);
      if (search.transmission)
        query = query.eq("transmission", search.transmission as "manuel" | "otomatik" | "yari_otomatik");
      if (search.sellerType)
        query = query.eq("seller_type", search.sellerType as "sahibinden" | "galeriden" | "yetkili_bayi");
      if (search.trade) query = query.eq("trade_possible", true);
      if (search.noDamage) query = query.eq("has_damage_record", false);

      switch (search.sort) {
        case "fiyat_artan":
          query = query.order("price", { ascending: true });
          break;
        case "fiyat_azalan":
          query = query.order("price", { ascending: false });
          break;
        case "populer":
          query = query.order("view_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(60);
      if (error) throw error;
      return data as MotoCardData[];
    },
  });

  const filters = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Marka</Label>
        <Select
          value={search.brand ?? "hepsi"}
          onValueChange={(v) => setFilter({ brand: v === "hepsi" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tüm markalar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Tüm markalar</SelectItem>
            {MOTO_BRANDS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>İl</Label>
        <Select
          value={search.city ?? "hepsi"}
          onValueChange={(v) => setFilter({ city: v === "hepsi" ? undefined : v })}
        >
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
      </div>

      <div className="space-y-2">
        <Label>Fiyat aralığı (₺)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="min"
            defaultValue={search.minPrice}
            onBlur={(e) => setFilter({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="max"
            defaultValue={search.maxPrice}
            onBlur={(e) => setFilter({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Yıl aralığı</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="min"
            defaultValue={search.minYear}
            onBlur={(e) => setFilter({ minYear: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="max"
            defaultValue={search.maxYear}
            onBlur={(e) => setFilter({ maxYear: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Motor hacmi (cc)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="min"
            defaultValue={search.minCc}
            onBlur={(e) => setFilter({ minCc: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="max"
            defaultValue={search.maxCc}
            onBlur={(e) => setFilter({ maxCc: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Maksimum kilometre</Label>
        <Input
          type="number"
          placeholder="Örn: 30000"
          defaultValue={search.maxKm}
          onBlur={(e) => setFilter({ maxKm: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>Vites</Label>
        <Select
          value={search.transmission ?? "hepsi"}
          onValueChange={(v) => setFilter({ transmission: v === "hepsi" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Farketmez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Farketmez</SelectItem>
            {TRANSMISSIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kimden</Label>
        <Select
          value={search.sellerType ?? "hepsi"}
          onValueChange={(v) => setFilter({ sellerType: v === "hepsi" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Farketmez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Farketmez</SelectItem>
            {SELLER_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={!!search.trade}
            onCheckedChange={(v) => setFilter({ trade: v ? true : undefined })}
          />
          Sadece takasa açık
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={!!search.noDamage}
            onCheckedChange={(v) => setFilter({ noDamage: v ? true : undefined })}
          />
          Sadece hasar kaydı olmayan
        </label>
      </div>

      <Button variant="outline" className="w-full" onClick={() => void navigate({ search: {} })}>
        Filtreleri Temizle
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="module-bar block w-10 text-moto" />
          <h1 className="mt-2 font-display text-3xl font-bold">Motosiklet İlanları</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Yükleniyor..." : `${data?.length ?? 0} ilan listeleniyor`}
          </p>
        </div>
        <Button asChild>
          <Link to="/motosikletler/ilan-ver">
            <Plus className="size-4" /> İlan Ver
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-4 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <Filter className="size-4" /> Filtreler
            </h2>
            {filters}
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="size-4" /> Filtrele
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-6">
                <SheetHeader className="px-0">
                  <SheetTitle>Filtreler</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{filters}</div>
              </SheetContent>
            </Sheet>

            <div className="ml-auto w-44">
              <Select
                value={search.sort ?? "yeni"}
                onValueChange={(v) => setFilter({ sort: v === "yeni" ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {data && data.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Aramanıza uygun ilan bulunamadı. Filtreleri değiştirmeyi deneyin.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {data?.map((listing) => <MotorcycleCard key={listing.id} listing={listing} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
