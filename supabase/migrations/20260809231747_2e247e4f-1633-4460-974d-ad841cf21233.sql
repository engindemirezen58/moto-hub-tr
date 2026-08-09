
DROP POLICY "moto_public_read" ON public.motorcycle_listings;
CREATE POLICY "moto_public_read" ON public.motorcycle_listings FOR SELECT USING (status IN ('onayli','satildi') OR auth.uid() = user_id);
CREATE POLICY "moto_admin_read" ON public.motorcycle_listings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY "part_public_read" ON public.part_listings;
CREATE POLICY "part_public_read" ON public.part_listings FOR SELECT USING (status IN ('onayli','satildi') OR auth.uid() = user_id);
CREATE POLICY "part_admin_read" ON public.part_listings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY "job_public_read" ON public.courier_jobs;
CREATE POLICY "job_public_read" ON public.courier_jobs FOR SELECT USING (status = 'onayli' OR auth.uid() = user_id);
CREATE POLICY "job_admin_read" ON public.courier_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY "dealers_self_update" ON public.dealer_profiles;
CREATE POLICY "dealers_self_update" ON public.dealer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
