
ALTER TABLE public.motorcycle_listings
  ADD COLUMN IF NOT EXISTS power_range text,
  ADD COLUMN IF NOT EXISTS timing_type text,
  ADD COLUMN IF NOT EXISTS cooling_type text,
  ADD COLUMN IF NOT EXISTS plate_origin text,
  ADD COLUMN IF NOT EXISTS has_heavy_damage boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS negotiable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS contact_preference text NOT NULL DEFAULT 'uygulama';

ALTER TABLE public.motorcycle_listings
  ADD CONSTRAINT motorcycle_contact_pref_chk
  CHECK (contact_preference IN ('uygulama','uygulama_telefon'));

CREATE TABLE IF NOT EXISTS public.listing_private_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.motorcycle_listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  plate_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_private_details TO authenticated;
GRANT ALL ON public.listing_private_details TO service_role;

ALTER TABLE public.listing_private_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "private_details_owner_read" ON public.listing_private_details
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "private_details_owner_insert" ON public.listing_private_details
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "private_details_owner_update" ON public.listing_private_details
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "private_details_owner_delete" ON public.listing_private_details
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_listing_private_details_updated_at
  BEFORE UPDATE ON public.listing_private_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
