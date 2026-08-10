import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, SlidersHorizontal } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PartCard, type PartCardData } from "@/components/listing/PartCard";
import { CITIES, CONDITIONS, PART_CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  condition: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.string().optional(),
});

type PartSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/parca-aksesuar/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Motosiklet Yedek Parça ve Aksesuar İlanları | MotoHub" },
      {
        name: "description",
        content:
          "Kask, egzoz, lastik, fren, motor parçaları ve sürüş kıyafetleri: sıfır, kullanılmış ve yenilenmiş parça ilanları.",
      },
      { property: "og:title", content: "Yedek Parça & Aksesuar - MotoHub" },
      {
        property: "og:description",
        content: "Motosikletiniz için uygun fiyatlı parça ve aksesuar ilanları.",
      },
    ],
  }),
  component: PartsListPage,
});

function PartsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/parca-aksesuar/" });
  const setFilter = (patch: Partial<PartSearch>) => {
    void navigate({ search: (prev: PartSearch) => ({ ...prev, ...patch }) });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["parts", search],
    queryFn: async () => {
      let query = supabase
        .from("part_listings")
        .select(
          "id, slug, title, category, condition, brand, price, city, district, photos, is_featured, created_at",
        )
        .eq("status", "onayli");

      if (search.q) query = query.ilike("title", `%${search.q}%`);
      if (search.category) query = query.eq("category", search.category);
      if (search.subcategory) query = query.eq("subcategory", search.subcategory);
      if (search.condition)
        query = query.eq("condition", search.condition as "sifir" | "kullanilmis" | "yenilenmis");
      if (search.city) query = query.eq("city", search.city);
      if (search.minPrice) query = query.gte("price", search.minPrice);
      if (search.maxPrice) query = query.lte("price", search.maxPrice);

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
      return data as PartCardData[];
    },
  });

  const categories = Object.keys(PART_CATEGORIES);
  const subcategories = search.category ? (PART_CATEGORIES[search.category] ?? []) : [];

  const filters = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Kategori</Label>
        <Select
          value={search.category ?? "hepsi"}
          onValueChange={(v) =>
            setFilter({ category: v === "hepsi" ? undefined : v, subcategory: undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tüm kategoriler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Tüm kategoriler</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {subcategories.length > 0 && (
        <div className="space-y-2">
          <Label>Alt Kategori</Label>
          <Select
            value={search.subcategory ?? "hepsi"}
            onValueChange={(v) => setFilter({ subcategory: v === "hepsi" ? undefined : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Hepsi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hepsi">Hepsi</SelectItem>
              {subcategories.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Durum</Label>
        <Select
          value={search.condition ?? "hepsi"}
          onValueChange={(v) => setFilter({ condition: v === "hepsi" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Farketmez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Farketmez</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
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

      <Button variant="outline" className="w-full" onClick={() => void navigate({ search: {} })}>
        Filtreleri Temizle
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="module-bar block w-10 text-parca" />
          <h1 className="mt-2 font-display text-3xl font-bold">Yedek Parça & Aksesuar</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Yükleniyor..." : `${data?.length ?? 0} ilan listeleniyor`}
          </p>
        </div>
        <Button asChild>
          <Link to="/parca-aksesuar/ilan-ver">
            <Plus className="size-4" /> İlan Ver
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-4 shadow-card">
            <h2 className="mb-4 font-display text-lg font-bold">Filtreler</h2>
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
              Aramanıza uygun parça ilanı bulunamadı.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {data?.map((listing) => <PartCard key={listing.id} listing={listing} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
