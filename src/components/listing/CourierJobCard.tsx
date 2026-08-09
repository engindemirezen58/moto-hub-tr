import { Link } from "@tanstack/react-router";
import { Building2, Clock, MapPin, Bike } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatNumber, relativeTime } from "@/lib/format";
import { WORK_TYPES } from "@/lib/constants";

export type JobCardData = {
  id: string;
  slug: string;
  title: string;
  company_name: string;
  work_type: string;
  salary_min: number | string | null;
  salary_max: number | string | null;
  requires_own_bike: boolean;
  city: string;
  district: string | null;
  shift_hours: string | null;
  created_at: string;
};

export function CourierJobCard({ job }: { job: JobCardData }) {
  const workType = WORK_TYPES.find((w) => w.value === job.work_type)?.label ?? job.work_type;
  const salary =
    job.salary_min && job.salary_max
      ? `${formatNumber(job.salary_min)} - ${formatNumber(job.salary_max)} ₺`
      : "Görüşülür";

  return (
    <Link
      to="/kurye-ilanlari/$slug"
      params={{ slug: job.slug }}
      className="card-hover block rounded-xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{job.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 className="size-3.5" /> {job.company_name}
          </p>
        </div>
        <Badge className="bg-kurye text-primary-foreground">{workType}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" /> {job.city}
          {job.district ? ` / ${job.district}` : ""}
        </span>
        {job.shift_hours && (
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {job.shift_hours}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Bike className="size-3.5" />
          {job.requires_own_bike ? "Kendi motoru olan" : "Motosiklet sağlanıyor"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="font-display text-lg font-bold text-kurye">{salary}</span>
        <span className="text-[11px] text-muted-foreground">{relativeTime(job.created_at)}</span>
      </div>
    </Link>
  );
}
