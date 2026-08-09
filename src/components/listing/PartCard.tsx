import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { formatPrice, relativeTime } from "@/lib/format";
import { CONDITIONS } from "@/lib/constants";

export type PartCardData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  condition: string;
  brand: string | null;
  price: number | string;
  city: string;
  district: string | null;
  photos: string[];
  is_featured: boolean;
  created_at: string;
};

const FALLBACK = "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&q=60";

export function PartCard({ listing }: { listing: PartCardData }) {
  const condition = CONDITIONS.find((c) => c.value === listing.condition)?.label ?? listing.condition;

  return (
    <article className="card-hover group relative overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <Link to="/parca-aksesuar/$slug" params={{ slug: listing.slug }} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          <img
            src={listing.photos[0] ?? FALLBACK}
            alt={`${listing.title} ürün fotoğrafı`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex gap-1">
            {listing.is_featured && (
              <Badge className="gap-1 bg-parca text-primary-foreground">
                <Star className="size-3" /> Öne Çıkan
              </Badge>
            )}
            <Badge variant="secondary">{condition}</Badge>
          </div>
        </div>

        <div className="space-y-2 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-parca">
            {listing.category}
          </p>
          <h3 className="line-clamp-2-safe min-h-10 text-sm font-semibold leading-5">
            {listing.title}
          </h3>
          <p className="font-display text-xl font-bold text-foreground">
            {formatPrice(listing.price)}
          </p>
          <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {listing.city}
            </span>
            <span>{relativeTime(listing.created_at)}</span>
          </div>
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <FavoriteButton listingId={listing.id} listingType="part" />
      </div>
    </article>
  );
}
