import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MotorcycleCard, type MotoCardData } from "@/components/listing/MotorcycleCard";
import { PartCard, type PartCardData } from "@/components/listing/PartCard";
import { CourierJobCard, type JobCardData } from "@/components/listing/CourierJobCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/hesabim/")({
  head: () => ({
    meta: [
      { title: "Hesabım | İlanlarım ve Favorilerim - MotoHub" },
      {
        name: "description",
        content: "MotoHub hesabınız: yayındaki ilanlarınızı, favorilerinizi ve mesajlarınızı yönetin.",
      },
      { property: "og:title", content: "Hesabım - MotoHub" },
      { property: "og:description", content: "İlanlarınızı ve favorilerinizi yönetin." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, signOut } = useAuth();

  const { data } = useQuery({
    queryKey: ["account", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [motos, parts, jobs] = await Promise.all([
        supabase
          .from("motorcycle_listings")
          .select(
            "id, slug, title, price, year, mileage, engine_cc, city, district, photos, is_featured, trade_possible, is_new, created_at",
          )
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("part_listings")
          .select(
            "id, slug, title, category, condition, brand, price, city, district, photos, is_featured, created_at",
          )
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("courier_jobs")
          .select(
            "id, slug, title, company_name, work_type, salary_min, salary_max, requires_own_bike, city, district, shift_hours, created_at",
          )
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
      ]);
      return {
        motos: (motos.data ?? []) as MotoCardData[],
        parts: (parts.data ?? []) as PartCardData[],
        jobs: (jobs.data ?? []) as JobCardData[],
      };
    },
  });

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">Yükleniyor...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Hesabınıza giriş yapın</h1>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link to="/giris">Giriş Yap</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/kayit">Üye Ol</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Hesabım</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/hesabim/mesajlar">Mesajlarım</Link>
          </Button>
          <Button variant="ghost" onClick={() => void signOut()}>
            Çıkış Yap
          </Button>
        </div>
      </div>

      <Tabs defaultValue="motos">
        <TabsList>
          <TabsTrigger value="motos">Motosikletler</TabsTrigger>
          <TabsTrigger value="parts">Parçalar</TabsTrigger>
          <TabsTrigger value="jobs">İş İlanları</TabsTrigger>
        </TabsList>

        <TabsContent value="motos" className="mt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {data?.motos.map((l) => <MotorcycleCard key={l.id} listing={l} />)}
          </div>
          {data?.motos.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz motosiklet ilanınız yok.</p>
          )}
        </TabsContent>

        <TabsContent value="parts" className="mt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {data?.parts.map((l) => <PartCard key={l.id} listing={l} />)}
          </div>
          {data?.parts.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz parça ilanınız yok.</p>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {data?.jobs.map((j) => <CourierJobCard key={j.id} job={j} />)}
          </div>
          {data?.jobs.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz iş ilanınız yok.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
