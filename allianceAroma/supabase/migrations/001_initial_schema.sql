-- ============================================
-- AllianceAroma Parfüm E-ticaret + 10 Seviye Affiliate
-- Supabase Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (auth.users ile 1:1, affiliate bilgileri)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  referral_code TEXT,
  referrer_id UUID REFERENCES public.profiles(id),
  referrer_path TEXT,
  is_affiliate BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral code unique index (null allowed)
CREATE UNIQUE INDEX profiles_referral_code_key ON public.profiles(referral_code) WHERE referral_code IS NOT NULL;

-- Referrer path index (10 seviye sorgular için)
CREATE INDEX profiles_referrer_path_idx ON public.profiles USING btree(referrer_path);

-- ============================================
-- PRODUCTS (parfüm kataloğu)
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX orders_user_id_idx ON public.orders(user_id);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMISSIONS (10 seviye affiliate komisyonları)
-- ============================================
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level >= 1 AND level <= 10),
  amount DECIMAL(12,2) NOT NULL,
  order_total DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX commissions_affiliate_id_idx ON public.commissions(affiliate_id);
CREATE INDEX commissions_order_id_idx ON public.commissions(order_id);

-- ============================================
-- REFERRAL CLICKS (opsiyonel - analytics)
-- ============================================
CREATE TABLE public.referral_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;

-- Profiles: kullanıcı kendi profilini okuyabilir/güncelleyebilir
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: kullanıcı kendi downline'ını görebilir (referrer_path benim path'im ile başlayanlar)
CREATE POLICY "Users can view downline" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR referrer_path LIKE (
      SELECT COALESCE(referrer_path, '/' || auth.uid()::TEXT) || '%'
      FROM public.profiles WHERE id = auth.uid() LIMIT 1
    )
  );

-- Products: herkes okuyabilir
CREATE POLICY "Products are public" ON public.products
  FOR SELECT USING (true);

-- Orders: kullanıcı kendi siparişlerini görebilir
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Order items: sipariş sahibi görebilir
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Commissions: affiliate kendi komisyonlarını görebilir
CREATE POLICY "Affiliates can view own commissions" ON public.commissions
  FOR SELECT USING (auth.uid() = affiliate_id);

-- Referral clicks: affiliate kendi tıklamalarını görebilir
CREATE POLICY "Affiliates can view own clicks" ON public.referral_clicks
  FOR SELECT USING (auth.uid() = affiliate_id);

-- ============================================
-- TRIGGER: auth.users INSERT → profiles INSERT
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_path TEXT;
  v_referral_code TEXT;
  v_new_referral_code TEXT;
  v_path_parts TEXT[];
  v_path_len INT;
BEGIN
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  v_new_referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));

  -- Referral code varsa referrer'ı bul
  IF v_referral_code IS NOT NULL AND TRIM(v_referral_code) != '' THEN
    SELECT id, referrer_path INTO v_referrer_id, v_referrer_path
    FROM public.profiles
    WHERE UPPER(TRIM(referral_code)) = UPPER(TRIM(v_referral_code))
    LIMIT 1;
  END IF;

  -- referrer_path: root -> ... -> me (max 11 segment: 10 üst + kendim)
  IF v_referrer_id IS NOT NULL THEN
    v_referrer_path := COALESCE(NULLIF(TRIM(v_referrer_path), ''), '/' || v_referrer_id::TEXT);
    v_referrer_path := v_referrer_path || '/' || NEW.id::TEXT;
    -- Son 11 segment al (10 üst + yeni kullanıcı)
    v_path_parts := string_to_array(trim(both '/' from v_referrer_path), '/');
    v_path_len := array_length(v_path_parts, 1);
    IF v_path_len > 11 THEN
      v_referrer_path := '/' || array_to_string(v_path_parts[v_path_len - 10 : v_path_len], '/');
    END IF;
  ELSE
    v_referrer_path := '/' || NEW.id::TEXT;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, referral_code, referrer_id, referrer_path, is_affiliate)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    v_new_referral_code,
    v_referrer_id,
    v_referrer_path,
    COALESCE((NEW.raw_user_meta_data->>'is_affiliate')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FONKSİYON: Sipariş sonrası komisyon hesaplama
-- (Server Action veya Webhook'tan çağrılacak)
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_commissions(
  p_order_id UUID,
  p_order_total DECIMAL
)
RETURNS void AS $$
DECLARE
  v_buyer_id UUID;
  v_referrer_path TEXT;
  v_path_parts TEXT[];
  v_ancestor_id UUID;
  v_level INT;
  v_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
  v_level_rates DECIMAL[] := ARRAY[0.10, 0.05, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01];
  v_i INT;
BEGIN
  SELECT user_id INTO v_buyer_id FROM public.orders WHERE id = p_order_id;
  SELECT referrer_path INTO v_referrer_path FROM public.profiles WHERE id = v_buyer_id;

  IF v_referrer_path IS NULL OR LENGTH(TRIM(v_referrer_path)) < 2 THEN
    RETURN;
  END IF;

  -- Path: /root/u2/u3/buyer -> parts = [root,u2,u3,buyer], son eleman buyer
  v_path_parts := string_to_array(trim(both '/' from v_referrer_path), '/');

  -- Son eleman buyer, onu çıkar. Kalan = üstler (en yakından en uzağa: u3, u2, root)
  -- Level 1 = u3 (direct), Level 2 = u2, Level 3 = root
  v_level := 1;
  FOR v_i IN REVERSE (array_length(v_path_parts, 1) - 1)..1
  LOOP
    EXIT WHEN v_level > 10;
    BEGIN
      v_ancestor_id := v_path_parts[v_i]::UUID;
      IF v_ancestor_id = v_buyer_id THEN
        CONTINUE;
      END IF;

      v_commission_rate := v_level_rates[v_level];
      v_commission_amount := ROUND(p_order_total * v_commission_rate, 2);

      IF v_commission_amount > 0 THEN
        INSERT INTO public.commissions (affiliate_id, order_id, level, amount, order_total, status)
        VALUES (v_ancestor_id, p_order_id, v_level, v_commission_amount, p_order_total, 'pending');
      END IF;

      v_level := v_level + 1;
    EXCEPTION WHEN OTHERS THEN
      -- Geçersiz UUID, atla
      NULL;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
