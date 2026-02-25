
-- Cars table
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  body_type TEXT NOT NULL DEFAULT 'sedan',
  fuel_type TEXT NOT NULL DEFAULT 'petrol',
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Variants table
CREATE TABLE public.variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ex_showroom_price NUMERIC NOT NULL,
  registration_cost NUMERIC DEFAULT 0,
  insurance_cost_yearly NUMERIC DEFAULT 0,
  road_tax NUMERIC DEFAULT 0,
  engine_cc INTEGER,
  transmission TEXT DEFAULT 'manual',
  mileage_kmpl NUMERIC,
  fuel_tank_liters NUMERIC,
  horsepower INTEGER,
  torque_nm INTEGER,
  safety_rating INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Features table
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'comfort',
  description TEXT,
  plain_explanation TEXT,
  practicality_score INTEGER DEFAULT 5 CHECK (practicality_score BETWEEN 1 AND 10),
  repair_risk TEXT DEFAULT 'low',
  insurance_impact TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Variant features junction with incremental cost
CREATE TABLE public.variant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  incremental_cost NUMERIC DEFAULT 0,
  usefulness_score INTEGER DEFAULT 5 CHECK (usefulness_score BETWEEN 1 AND 10),
  resale_impact TEXT DEFAULT 'neutral',
  UNIQUE(variant_id, feature_id)
);

-- City pricing
CREATE TABLE public.city_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  on_road_price NUMERIC NOT NULL,
  registration_cost NUMERIC DEFAULT 0,
  road_tax NUMERIC DEFAULT 0,
  insurance_cost NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  UNIQUE(variant_id, city)
);

-- Depreciation models
CREATE TABLE public.depreciation_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  year_number INTEGER NOT NULL,
  depreciation_pct NUMERIC NOT NULL,
  resale_value_pct NUMERIC NOT NULL,
  UNIQUE(car_id, year_number)
);

-- User profiles for onboarding
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_min NUMERIC,
  budget_max NUMERIC,
  ownership_years INTEGER DEFAULT 5,
  city TEXT,
  daily_usage_km NUMERIC,
  highway_pct INTEGER DEFAULT 50,
  driving_style TEXT DEFAULT 'balanced',
  family_size INTEGER DEFAULT 2,
  tech_preference TEXT DEFAULT 'moderate',
  future_plans TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciation_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Cars, variants, features are public read
CREATE POLICY "Anyone can read cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Anyone can read variants" ON public.variants FOR SELECT USING (true);
CREATE POLICY "Anyone can read features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Anyone can read variant_features" ON public.variant_features FOR SELECT USING (true);
CREATE POLICY "Anyone can read city_pricing" ON public.city_pricing FOR SELECT USING (true);
CREATE POLICY "Anyone can read depreciation_models" ON public.depreciation_models FOR SELECT USING (true);

-- User profiles: users manage their own
CREATE POLICY "Users can read own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Admin role setup
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for write operations
CREATE POLICY "Admins can manage cars" ON public.cars FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage variants" ON public.variants FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage features" ON public.features FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage variant_features" ON public.variant_features FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage city_pricing" ON public.city_pricing FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage depreciation_models" ON public.depreciation_models FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read user_roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON public.variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_variants_car_id ON public.variants(car_id);
CREATE INDEX idx_variant_features_variant_id ON public.variant_features(variant_id);
CREATE INDEX idx_city_pricing_variant_id ON public.city_pricing(variant_id);
CREATE INDEX idx_depreciation_models_car_id ON public.depreciation_models(car_id);
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
