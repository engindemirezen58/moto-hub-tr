import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, SlidersHorizontal } from "lucide-react";
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
import { CourierJobCard, type JobCardData } from "@/components/listing/CourierJobCard";
import { CITIES, WORK_TYPES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  workType: z.string().optional(),
  minSalary: z.coerce.number().optional(),
  ownBike: z.boolean().optional(),
});

type JobSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/kurye-ilanlari/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Motokurye İş İlanları | Kurye Arayanlar ve İş Arayanlar - MotoHub" },
      {
        name: "description",
        content:
          "Şehrinizdeki güncel motokurye iş ilanları: tam zamanlı, yarı zamanlı ve günlük çalışma fırsatları, maaş aralıklarıyla.",
      },
      { property: "og:title", content: "Kurye İş İlanları - MotoHub" },
      { property: "og:description", content: "Güncel motokurye iş ilanlarını inceleyin ve başvurun." },
    ],
  }),
  component: JobsListPage,
});

function JobsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/kurye-ilanlari/" });
  const setFilter = (patch: Partial<JobSearch>) => {
    void navigate({ search: (prev: JobSearch) => ({ ...prev, ...patch }) });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", search],
    queryFn: async () => {
      let query = supabase
        .from("courier_jobs")
        .select(
          "id, slug, title, company_name, work_type, salary_min, salary_max, requires_own_bike, city, district, shift_hours, created_at",
        )
        .eq("status", "onayli");

      if (search.q) query = query.ilike("title", `%${search.q}%`);
      if (search.city) query = query.eq("city", search.city);
      if (search.workType)
        query = query.eq("work_type", search.workType as "tam_zamanli" | "yari_zamanli" | "gunluk");
      if (search.minSalary) query = query.gte("salary_min", search.minSalary);
      if (search.ownBike === true) query = query.eq("requires_own_bike", true);

      const { data, error } = await query.order("created_at", { ascending: false }).limit(60);
      if (error) throw error;
      return data as JobCardData[];
    },
  });

  const filters = (
    <div className="space-y-5">
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
        <Label>Çalışma Şekli</Label>
        <Select
          value={search.workType ?? "hepsi"}
          onValueChange={(v) => setFilter({ workType: v === "hepsi" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Farketmez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hepsi">Farketmez</SelectItem>
            {WORK_TYPES.map((w) => (
              <SelectItem key={w.value} value={w.value}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Minimum maaş (₺)</Label>
        <Input
          type="number"
          placeholder="Örn: 30000"
          defaultValue={search.minSalary}
          onBlur={(e) => setFilter({ minSalary: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={!!search.ownBike}
          onCheckedChange={(v) => setFilter({ ownBike: v ? true : undefined })}
        />
        Kendi motoru olanlar için
      </label>

      <Button variant="outline" className="w-full" onClick={() => void navigate({ search: {} })}>
        Filtreleri Temizle
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="module-bar block w-10 text-kurye" />
          <h1 className="mt-2 font-display text-3xl font-bold">Kurye İş İlanları</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Yükleniyor..." : `${data?.length ?? 0} ilan listeleniyor`}
          </p>
        </div>
        <Button asChild>
          <Link to="/kurye-ilanlari/ilan-ver">
            <Plus className="size-4" /> İş İlanı Ver
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="mb-4 lg:hidden">
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

          {data && data.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Aramanıza uygun iş ilanı bulunamadı.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {data?.map((job) => <CourierJobCard key={job.id} job={job} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
