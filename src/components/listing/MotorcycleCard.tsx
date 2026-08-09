import { Link } from "@tanstack/react-router";
import { Gauge, MapPin, Calendar, Repeat, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { formatNumber, formatPrice, relativeTime } from "@/lib/format";

export type MotoCardData = {
  id: string;
  slug: string;
  title: string;
  price: number | string;
  year: number;
  mileage: number;
  engine_cc: number;
  city: string;
  district: string | null;
  photos: string[];
  is_featured: boolean;
  trade_possible: boolean;
  is_new: boolean;
  created_at: string;
};

const FALLBACK = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=60";

export function MotorcycleCard({ listing }: { listing: MotoCardData }) {
  return (
    <article className="card-hover group relative overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <Link
        to="/motosikletler/$slug"
        params={{ slug: listing.slug }}
        className="block"
        aria-label={listing.title}
      >
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          <img
            src={listing.photos[0] ?? FALLBACK}
            alt={`${listing.title} ilan fotoğrafı`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {listing.is_featured && (
              <Badge className="gap-1 bg-primary text-primary-foreground">
                <Star className="size-3" /> Öne Çıkan
              </Badge>
            )}
            {listing.is_new && <Badge variant="secondary">Sıfır</Badge>}
          </div>
        </div>

        <div className="space-y-2 p-3">
          <h3 className="line-clamp-2-safe min-h-10 text-sm font-semibold leading-5">
            {listing.title}
          </h3>
          <p className="font-display text-xl font-bold text-primary">{formatPrice(listing.price)}</p>

          <div className="grid grid-cols-3 gap-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> {listing.year}
            </span>
            <span className="flex items-center gap-1">
              <Gauge className="size-3" /> {formatNumber(listing.mileage)} km
            </span>
            <span>{listing.engine_cc} cc</span>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {listing.city}
              {listing.district ? ` / ${listing.district}` : ""}
            </span>
            <span>{relativeTime(listing.created_at)}</span>
          </div>

          {listing.trade_possible && (
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[11px] text-secondary-foreground">
              <Repeat className="size-3" /> Takasa açık
            </span>
          )}
        </div>
      </Link>

      <div className="absolute right-2 top-2">
        <FavoriteButton listingId={listing.id} listingType="motorcycle" />
      </div>
    </article>
  );
}
