import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Props = {
  listingId: string;
  listingType: "motorcycle" | "part";
  className?: string;
};

export function FavoriteButton({ listingId, listingType, className }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("listing_id, listing_type")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const isFavorite = !!favorites?.some(
    (f) => f.listing_id === listingId && f.listing_type === listingType,
  );

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Favorilere eklemek için giriş yapmalısınız.");
      return;
    }
    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .eq("listing_type", listingType);
      if (error) {
        toast.error("Favoriden çıkarılamadı.");
        return;
      }
      toast.success("Favorilerden çıkarıldı.");
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, listing_id: listingId, listing_type: listingType });
      if (error) {
        toast.error("Favorilere eklenemedi.");
        return;
      }
      toast.success("Favorilere eklendi.");
    }
    void queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={toggle}
      aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={cn("size-8 rounded-full bg-surface/90 shadow-card hover:bg-surface", className)}
    >
      <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
    </Button>
  );
}
