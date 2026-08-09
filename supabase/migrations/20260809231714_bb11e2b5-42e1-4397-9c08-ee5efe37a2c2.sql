
CREATE TYPE public.app_role AS ENUM ('bireysel','magaza','admin');
CREATE TYPE public.listing_status AS ENUM ('beklemede','onayli','reddedildi','satildi');
CREATE TYPE public.seller_type AS ENUM ('sahibinden','galeriden','yetkili_bayi');
CREATE TYPE public.transmission_type AS ENUM ('manuel','otomatik','yari_otomatik');
CREATE TYPE public.condition_type AS ENUM ('sifir','kullanilmis','yenilenmis');
CREATE TYPE public.work_type AS ENUM ('tam_zamanli','yari_zamanli','gunluk');
CREATE TYPE public.application_status AS ENUM ('beklemede','gorusuluyor','reddedildi','kabul');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'bireysel',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'bireysel'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.dealer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tax_number TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  phone TEXT,
  working_hours TEXT,
  about TEXT,
  logo_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.dealer_profiles TO authenticated;
GRANT SELECT ON public.dealer_profiles TO anon;
GRANT ALL ON public.dealer_profiles TO service_role;
ALTER TABLE public.dealer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dealers_public_read" ON public.dealer_profiles FOR SELECT USING (true);
CREATE POLICY "dealers_self_write" ON public.dealer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dealers_self_update" ON public.dealer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER dealers_updated_at BEFORE UPDATE ON public.dealer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.motorcycle_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  engine_cc INTEGER NOT NULL,
  engine_type TEXT,
  transmission public.transmission_type NOT NULL DEFAULT 'manuel',
  fuel_type TEXT NOT NULL DEFAULT 'Benzin',
  color TEXT,
  price NUMERIC(12,2) NOT NULL,
  is_new BOOLEAN NOT NULL DEFAULT false,
  trade_possible BOOLEAN NOT NULL DEFAULT false,
  has_damage_record BOOLEAN NOT NULL DEFAULT false,
  seller_type public.seller_type NOT NULL DEFAULT 'sahibinden',
  description TEXT,
  city TEXT NOT NULL,
  district TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  status public.listing_status NOT NULL DEFAULT 'onayli',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_moto_status_created ON public.motorcycle_listings (status, created_at DESC);
CREATE INDEX idx_moto_brand ON public.motorcycle_listings (brand);
CREATE INDEX idx_moto_price ON public.motorcycle_listings (price);
CREATE INDEX idx_moto_city ON public.motorcycle_listings (city);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.motorcycle_listings TO authenticated;
GRANT SELECT ON public.motorcycle_listings TO anon;
GRANT ALL ON public.motorcycle_listings TO service_role;
ALTER TABLE public.motorcycle_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moto_public_read" ON public.motorcycle_listings FOR SELECT USING (status IN ('onayli','satildi') OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "moto_owner_insert" ON public.motorcycle_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "moto_owner_update" ON public.motorcycle_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "moto_owner_delete" ON public.motorcycle_listings FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER moto_updated_at BEFORE UPDATE ON public.motorcycle_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.part_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  compatible_models TEXT[] NOT NULL DEFAULT '{}',
  condition public.condition_type NOT NULL DEFAULT 'kullanilmis',
  brand TEXT,
  price NUMERIC(12,2) NOT NULL,
  description TEXT,
  city TEXT NOT NULL,
  district TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  status public.listing_status NOT NULL DEFAULT 'onayli',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_part_status_created ON public.part_listings (status, created_at DESC);
CREATE INDEX idx_part_category ON public.part_listings (category);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.part_listings TO authenticated;
GRANT SELECT ON public.part_listings TO anon;
GRANT ALL ON public.part_listings TO service_role;
ALTER TABLE public.part_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "part_public_read" ON public.part_listings FOR SELECT USING (status IN ('onayli','satildi') OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "part_owner_insert" ON public.part_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "part_owner_update" ON public.part_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "part_owner_delete" ON public.part_listings FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER part_updated_at BEFORE UPDATE ON public.part_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.courier_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  work_type public.work_type NOT NULL DEFAULT 'tam_zamanli',
  salary_min NUMERIC(12,2),
  salary_max NUMERIC(12,2),
  requires_own_bike BOOLEAN NOT NULL DEFAULT false,
  city TEXT NOT NULL,
  district TEXT,
  region TEXT,
  shift_hours TEXT,
  requirements TEXT,
  description TEXT,
  status public.listing_status NOT NULL DEFAULT 'onayli',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_job_status_created ON public.courier_jobs (status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courier_jobs TO authenticated;
GRANT SELECT ON public.courier_jobs TO anon;
GRANT ALL ON public.courier_jobs TO service_role;
ALTER TABLE public.courier_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "job_public_read" ON public.courier_jobs FOR SELECT USING (status = 'onayli' OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "job_owner_insert" ON public.courier_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "job_owner_update" ON public.courier_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "job_owner_delete" ON public.courier_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER job_updated_at BEFORE UPDATE ON public.courier_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.courier_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.courier_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT,
  experience TEXT,
  license_class TEXT,
  status public.application_status NOT NULL DEFAULT 'beklemede',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courier_applications TO authenticated;
GRANT ALL ON public.courier_applications TO service_role;
ALTER TABLE public.courier_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_read" ON public.courier_applications FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.courier_jobs j WHERE j.id = job_id AND j.user_id = auth.uid())
);
CREATE POLICY "app_insert" ON public.courier_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_update" ON public.courier_applications FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR public.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.courier_jobs j WHERE j.id = job_id AND j.user_id = auth.uid())
) WITH CHECK (true);
CREATE POLICY "app_delete" ON public.courier_applications FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER app_updated_at BEFORE UPDATE ON public.courier_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.repair_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  district TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  working_hours TEXT,
  service_types TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1),
  source TEXT NOT NULL DEFAULT 'manuel',
  google_place_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.repair_shops TO anon;
GRANT SELECT ON public.repair_shops TO authenticated;
GRANT ALL ON public.repair_shops TO service_role;
ALTER TABLE public.repair_shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shops_public_read" ON public.repair_shops FOR SELECT USING (true);
CREATE POLICY "shops_admin_write" ON public.repair_shops FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER shops_updated_at BEFORE UPDATE ON public.repair_shops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id, listing_type)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fav_own" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  listing_id UUID,
  listing_type TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_participants ON public.messages (receiver_id, sender_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_read" ON public.messages FOR SELECT TO authenticated USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY "msg_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "msg_update" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'acik',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "report_insert" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "report_read" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "report_admin_update" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "listing_photos_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'listing-photos');
CREATE POLICY "listing_photos_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "listing_photos_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

INSERT INTO public.motorcycle_listings (slug,title,brand,model,year,mileage,engine_cc,transmission,fuel_type,color,price,is_new,trade_possible,has_damage_record,seller_type,description,city,district,photos,is_featured,view_count) VALUES
('yamaha-mt-07-2022-siyah-01','Yamaha MT-07 2022 Siyah','Yamaha','MT-07',2022,12500,689,'manuel','Benzin','Siyah',385000,false,true,false,'sahibinden','Bakımları yetkili serviste yapılmış, hatasız MT-07. Akrapovic egzoz ve gidon ağırlığı hediye.','İstanbul','Kadıköy','{https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80}',true,342),
('honda-pcx-125-2023-beyaz-02','Honda PCX 125 2023 Beyaz','Honda','PCX 125',2023,4200,125,'otomatik','Benzin','Beyaz',148000,false,false,false,'sahibinden','Şehir içi kullanım için ideal, tek elden temiz scooter.','Ankara','Çankaya','{https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80}',true,198),
('bmw-r-1250-gs-2021-03','BMW R 1250 GS 2021','BMW','R 1250 GS',2021,28000,1254,'manuel','Benzin','Gri',985000,false,true,false,'galeriden','Full paket, komple yan çanta ve koruma demirleri dahil. Uzun yol için hazır.','İzmir','Karşıyaka','{https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=80}',true,521),
('kawasaki-ninja-400-2020-04','Kawasaki Ninja 400 2020','Kawasaki','Ninja 400',2020,19800,399,'manuel','Benzin','Yeşil',295000,false,false,true,'sahibinden','A2 ehliyetine uygun, keyifli bir spor motosiklet. Küçük bir düşme kaydı mevcuttur.','Bursa','Nilüfer','{https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200&q=80}',false,143),
('ktm-duke-390-2024-sifir-05','KTM Duke 390 2024 Sıfır','KTM','Duke 390',2024,0,399,'manuel','Benzin','Turuncu',389000,true,false,false,'yetkili_bayi','Sıfır kilometre, anahtar teslim. Stoklarımızda sınırlı sayıda.','İstanbul','Şişli','{https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1200&q=80}',false,87),
('vespa-primavera-150-2019-06','Vespa Primavera 150 2019','Vespa','Primavera 150',2019,15600,150,'otomatik','Benzin','Mavi',175000,false,true,false,'sahibinden','Klasik tasarım, günlük kullanıma hazır. Kask ve bagaj hediye.','Antalya','Muratpaşa','{https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1200&q=80}',false,64);

INSERT INTO public.part_listings (slug,title,category,subcategory,compatible_models,condition,brand,price,description,city,district,photos,is_featured) VALUES
('agv-k6-kask-siyah-01','AGV K6 Kask - Siyah (M Beden)','Kask','Kapalı Kask','{Tüm modeller}','sifir','AGV',18500,'Sıfır, kutusunda AGV K6. M beden, ECE onaylı.','İstanbul','Beşiktaş','{https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=1200&q=80}',true),
('michelin-road-6-lastik-02','Michelin Road 6 Lastik Takımı 120/70-180/55','Lastik & Jant','Lastik','{Yamaha MT-07,Kawasaki Z900}','sifir','Michelin',14200,'Sıfır takım lastik, 2024 üretim.','Ankara','Yenimahalle','{https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&q=80}',false),
('brembo-fren-balatasi-03','Brembo Ön Fren Balatası','Fren Sistemi','Balata','{Birçok modelle uyumlu}','sifir','Brembo',2450,'Orijinal Brembo balata, faturalı.','İzmir','Bornova','{https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&q=80}',false),
('deri-mont-koruyuculu-04','Korumalı Deri Motosiklet Montu (L)','Kıyafet & Koruyucu','Mont','{Tüm modeller}','kullanilmis','Dainese',6800,'Az kullanılmış, CE korumaları tam.','Bursa','Osmangazi','{https://images.unsplash.com/photo-1547949003-9792a18a2601?w=1200&q=80}',false);

INSERT INTO public.courier_jobs (slug,title,company_name,work_type,salary_min,salary_max,requires_own_bike,city,district,region,shift_hours,requirements,description) VALUES
('kadikoy-moto-kurye-tam-zamanli-01','Kadıköy Bölgesi Moto Kurye','Hızlı Lojistik','tam_zamanli',38000,52000,true,'İstanbul','Kadıköy','Anadolu Yakası','09:00 - 18:00','A2 ehliyet, en az 1 yıl deneyim','Kadıköy ve çevresinde çalışacak, kendi motosikleti olan kurye arıyoruz. Yakıt desteği ve SGK mevcuttur.'),
('cankaya-yemek-kuryesi-02','Çankaya Yemek Kuryesi (Yarı Zamanlı)','Lezzet Durağı','yari_zamanli',18000,24000,false,'Ankara','Çankaya','Merkez','17:00 - 23:00','B sınıfı veya A2 ehliyet','Akşam vardiyası için kurye alınacaktır. Motosiklet işletme tarafından sağlanır.'),
('izmir-gunluk-kurye-03','İzmir Günlük Kurye','Ege Kargo','gunluk',1500,2200,true,'İzmir','Konak','Merkez','Esnek','Kendi motosikleti olan','Günlük ödeme ile esnek çalışma imkanı.');

INSERT INTO public.repair_shops (name,address,city,district,lat,lng,phone,working_hours,service_types,rating,source) VALUES
('Moto Teknik Servis','Caferağa Mah. Moda Cad. No:12','İstanbul','Kadıköy',40.9862,29.0300,'0216 555 11 22','Hafta içi 09:00-19:00, Cumartesi 10:00-16:00','{Genel Bakım,Elektrik,Lastik}',4.6,'manuel'),
('Yol Arkadaşı Motosiklet','Mecidiyeköy Mah. Büyükdere Cad. No:45','İstanbul','Şişli',41.0670,28.9930,'0212 555 33 44','Hafta içi 08:30-18:30','{Genel Bakım,Kaporta/Boya}',4.2,'manuel'),
('Başkent Moto Center','Kızılay Mah. Atatürk Bulvarı No:88','Ankara','Çankaya',39.9200,32.8540,'0312 555 66 77','Her gün 09:00-20:00','{Genel Bakım,Lastik,Elektrik,Kaporta/Boya}',4.8,'manuel'),
('Ege Motor Tamir','Alsancak Mah. Kıbrıs Şehitleri Cad. No:5','İzmir','Konak',38.4320,27.1420,'0232 555 88 99','Hafta içi 09:00-18:00','{Genel Bakım,Lastik}',4.4,'manuel');
