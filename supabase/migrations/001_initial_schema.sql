-- ============================================================================
-- FURCHO E-COMMERCE PLATFORM - SUPABASE POSTGRESQL SCHEMA
-- Phase 2: Complete Normalized Schema (19 Required Tables)
-- Money is stored strictly in integer minor units (paise: ₹2,999 = 299900)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE store_section_code AS ENUM ('EVERYDAY', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PENDING',
    'CONTACTED',
    'CONFIRMED',
    'PROCESSING',
    'DISPATCHED',
    'DELIVERED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE enquiry_status AS ENUM (
    'NEW',
    'CONTACTED',
    'DISCUSSION',
    'QUOTATION_SENT',
    'APPROVED',
    'REJECTED',
    'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. store_sections
CREATE TABLE IF NOT EXISTS store_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code store_section_code UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. categories (supports parent/child categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_section_id UUID REFERENCES store_sections(id) ON DELETE RESTRICT,
  store_section store_section_code NOT NULL DEFAULT 'EVERYDAY',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  banner_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_section ON categories(store_section);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 4. products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_section store_section_code NOT NULL DEFAULT 'EVERYDAY',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  selling_price_paise INTEGER NOT NULL CHECK (selling_price_paise >= 0),
  original_price_paise INTEGER CHECK (original_price_paise IS NULL OR original_price_paise >= 0),
  launch_price_label TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  dimensions TEXT,
  material TEXT,
  delivery_info TEXT DEFAULT 'Delivery charges confirmed based on customer location across Kerala.',
  stock_quantity INTEGER NOT NULL DEFAULT 10,
  availability_status TEXT NOT NULL DEFAULT 'IN_STOCK',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  request_quote_only BOOLEAN NOT NULL DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_section ON products(store_section);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending);

-- 5. product_images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  view_label TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- 6. product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price_override_paise INTEGER CHECK (price_override_paise IS NULL OR price_override_paise >= 0),
  finish_or_color TEXT,
  dimensions TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- 7. customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  district TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 8. addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT NOT NULL,
  city_town TEXT NOT NULL,
  full_address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  is_default BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);

-- 9. carts
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- 11. orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  district TEXT NOT NULL,
  city_town TEXT NOT NULL,
  full_address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  delivery_instructions TEXT,
  status order_status NOT NULL DEFAULT 'PENDING',
  subtotal_paise INTEGER NOT NULL CHECK (subtotal_paise >= 0),
  delivery_charge_paise INTEGER,
  confirmed_payable_paise INTEGER,
  total_paise INTEGER NOT NULL CHECK (total_paise >= 0),
  payment_method TEXT NOT NULL DEFAULT 'ORDER_REQUEST',
  payment_status TEXT NOT NULL DEFAULT 'UNPAID',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  internal_notes TEXT,
  is_purchase_tracked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- 12. order_items (Snapshot retained permanently)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  product_sku_snapshot TEXT NOT NULL,
  selected_variant_snapshot TEXT,
  product_image_snapshot TEXT,
  unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_paise INTEGER NOT NULL CHECK (line_total_paise >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 13. order_status_history
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status order_status,
  new_status order_status NOT NULL,
  note TEXT,
  changed_by TEXT DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- 14. enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  store_section store_section_code NOT NULL DEFAULT 'EVERYDAY',
  enquiry_category TEXT NOT NULL,
  product_reference TEXT,
  requirement_description TEXT NOT NULL,
  preferred_dimensions TEXT,
  material_finish TEXT,
  budget_range TEXT,
  project_location TEXT,
  status enquiry_status NOT NULL DEFAULT 'NEW',
  assigned_staff TEXT,
  internal_notes TEXT,
  follow_up_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_section ON enquiries(store_section);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);

-- 15. enquiry_attachments
CREATE TABLE IF NOT EXISTS enquiry_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_enquiry_attachments_enquiry ON enquiry_attachments(enquiry_id);

-- 16. quotations
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE NOT NULL,
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  quoted_amount_paise INTEGER NOT NULL CHECK (quoted_amount_paise >= 0),
  valid_until DATE,
  document_url TEXT,
  summary_notes TEXT,
  status TEXT NOT NULL DEFAULT 'SENT',
  created_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quotations_enquiry ON quotations(enquiry_id);

-- 17. banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement TEXT NOT NULL,
  store_section store_section_code NOT NULL DEFAULT 'EVERYDAY',
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT,
  cta_primary_text TEXT,
  cta_primary_link TEXT,
  cta_secondary_text TEXT,
  cta_secondary_link TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. delivery_rules
CREATE TABLE IF NOT EXISTS delivery_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district TEXT UNIQUE NOT NULL,
  estimated_charge_paise INTEGER,
  free_delivery_threshold_paise INTEGER,
  estimated_days TEXT NOT NULL DEFAULT '3-5 Business Days',
  notes TEXT DEFAULT 'Confirmed after address verification',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_text TEXT NOT NULL DEFAULT 'Launch Offer: Foldable Ironing Table at ₹2,999',
  announcement_badge TEXT DEFAULT 'Limited Time Offer',
  announcement_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  featured_product_slug TEXT NOT NULL DEFAULT 'foldable-wall-mounted-ironing-table',
  promo_price_paise INTEGER NOT NULL DEFAULT 299900,
  promo_countdown_end TIMESTAMPTZ,
  whatsapp_number TEXT NOT NULL DEFAULT '919876543210',
  support_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  support_email TEXT NOT NULL DEFAULT 'hello@furcho.in',
  meta_pixel_id TEXT,
  footer_tagline TEXT NOT NULL DEFAULT 'Thoughtful furniture and smart home solutions for modern living across Kerala.',
  address_line TEXT NOT NULL DEFAULT 'Furcho Studio, NH-66 Bypass, Kozhikode, Kerala, India - 673016',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
