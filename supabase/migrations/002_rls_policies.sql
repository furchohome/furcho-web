-- ============================================================================
-- FURCHO E-COMMERCE PLATFORM - SUPABASE ROW LEVEL SECURITY (RLS)
-- Phase 2: Strict Row Level Security & Storage Policies
-- ============================================================================

-- Helper function to verify if current authenticated user is ADMIN or STAFF
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('ADMIN', 'STAFF')
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all 19 tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Storefront
CREATE POLICY "Public can read active store sections"
  ON store_sections FOR SELECT
  USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can read active variants"
  ON product_variants FOR SELECT
  USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "Public can read active banners"
  ON banners FOR SELECT
  USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "Public can read active delivery rules"
  ON delivery_rules FOR SELECT
  USING (is_active = TRUE OR is_admin_or_staff());

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (TRUE);

-- Admin Write Policies on Storefront Content
CREATE POLICY "Admins manage store sections"
  ON store_sections FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Admins manage categories"
  ON categories FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Admins manage products"
  ON products FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Admins manage product images"
  ON product_images FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Admins manage product variants"
  ON product_variants FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Admins manage banners"
  ON banners FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Admins manage delivery rules"
  ON delivery_rules FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Admins manage site settings"
  ON site_settings FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- Profiles Policies
CREATE POLICY "Users can view own profile or admin all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin_or_staff());

CREATE POLICY "Admins manage profiles"
  ON profiles FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- Orders, Customers, Enquiries:
-- Public customers can INSERT via validated server endpoints, NEVER read other customers' orders
CREATE POLICY "Customers can submit orders"
  ON orders FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only staff can view and update orders"
  ON orders FOR SELECT
  USING (is_admin_or_staff());

CREATE POLICY "Only staff can modify orders"
  ON orders FOR UPDATE
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Customers can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only staff can read order items"
  ON order_items FOR SELECT
  USING (is_admin_or_staff());

CREATE POLICY "Only staff can manage order status history"
  ON order_status_history FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Customers can create customer record"
  ON customers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only staff can read and update customers"
  ON customers FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Customers can create address record"
  ON addresses FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only staff can read and update addresses"
  ON addresses FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

-- Enquiries & Quotations
CREATE POLICY "Public can submit custom enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only staff can view and manage enquiries"
  ON enquiries FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());

CREATE POLICY "Public can attach files to enquiries"
  ON enquiry_attachments FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only staff can view enquiry attachments"
  ON enquiry_attachments FOR SELECT
  USING (is_admin_or_staff());

CREATE POLICY "Only staff can manage quotations"
  ON quotations FOR ALL
  USING (is_admin_or_staff())
  WITH CHECK (is_admin_or_staff());
