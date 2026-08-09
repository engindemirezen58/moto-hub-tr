import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { relativeTime } from "@/lib/format";

export const Route = createFileRoute("/hesabim/mesajlar")({
  head: () => ({
    meta: [
      { title: "Mesajlarım | MotoHub" },
      {
        name: "description",
        content: "İlanlarınıza gelen mesajları görüntüleyin ve alıcılarla iletişimde kalın.",
      },
      { property: "og:title", content: "Mesajlarım - MotoHub" },
      { property: "og:description", content: "İlan mesajlarınızı tek yerden yönetin." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, loading } = useAuth();

  const { data } = useQuery({
    queryKey: ["messages", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Yükleniyor...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Mesajlar için giriş yapın</h1>
        <Button asChild className="mt-6">
          <Link to="/giris">Giriş Yap</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Mesajlarım</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        İlanlarınıza gelen ve gönderdiğiniz mesajlar.
      </p>

      <div className="space-y-3">
        {data?.map((m) => (
          <article key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{m.sender_id === user.id ? "Gönderdiniz" : "Gelen mesaj"}</span>
              <span>{relativeTime(m.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm">{m.content}</p>
          </article>
        ))}
      </div>

      {data && data.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Henüz mesajınız yok.
        </p>
      )}
    </div>
  );
}
