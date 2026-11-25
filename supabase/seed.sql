-- ============================================================================
-- FURCHO E-COMMERCE PLATFORM - VERIFIED INITIAL SEED DATA
-- Phase 2: Store sections, initial categories, and the verified Foldable
-- Wall-Mounted Ironing Table product + site settings.
-- ============================================================================

INSERT INTO store_sections (code, name, tagline, description, is_active)
VALUES
  ('EVERYDAY', 'Everyday Living', 'Affordable & Practical Home Furniture', 'Smart space-saving furniture, kitchen organizers, bedroom essentials and everyday accessories across Kerala.', TRUE),
  ('PREMIUM', 'Premium Living', 'Crafted Solid Wood & Bespoke Luxury', 'Bespoke wooden furniture, luxury residential interiors, and commercial furniture for restaurants, cafes and resorts.', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO site_settings (
  announcement_text,
  announcement_badge,
  announcement_enabled,
  featured_product_slug,
  promo_price_paise,
  promo_countdown_end,
  whatsapp_number,
  support_phone,
  support_email
) VALUES (
  'Launch Offer: Foldable Ironing Table at ₹2,999',
  'Limited Time Offer',
  TRUE,
  'foldable-wall-mounted-ironing-table',
  299900,
  NOW() + INTERVAL '2 days 12 hours 45 minutes',
  '919876543210',
  '+91 98765 43210',
  'hello@furcho.in'
);

-- Everyday Living Categories
INSERT INTO categories (store_section, name, slug, description, image_url, display_order, is_active)
VALUES
  ('EVERYDAY', 'Kitchen', 'kitchen', 'Smart kitchen essentials and compact furniture.', '/images/categories/kitchen.jpg', 1, TRUE),
  ('EVERYDAY', 'Bedroom', 'bedroom', 'Beds, wardrobes and smart bedroom setups.', '/images/categories/bedroom.jpg', 2, TRUE),
  ('EVERYDAY', 'Home Accessories', 'home-accessories', 'Space-saving and everyday home essentials.', '/images/categories/home-accessories.jpg', 3, TRUE),
  ('PREMIUM', 'Premium Bedroom', 'premium-bedroom', 'Handcrafted solid teak and walnut beds, bespoke wardrobes, and luxury bedroom suites.', '/images/premium/bedroom.jpg', 4, TRUE),
  ('PREMIUM', 'Premium Dining', 'premium-dining', 'Heirloom solid wood dining tables, cane-weave chairs, and architectural dining sets.', '/images/premium/dining.jpg', 5, TRUE),
  ('PREMIUM', 'Premium Sit-out', 'premium-sit-out', 'Verandah lounge chairs, traditional Kerala charupadi concepts, and outdoor luxury.', '/images/premium/sitout.jpg', 6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Featured Product: Foldable Wall-Mounted Ironing Table (Verified Information)
INSERT INTO products (
  store_section,
  category_id,
  name,
  slug,
  sku,
  short_description,
  description,
  selling_price_paise,
  original_price_paise,
  launch_price_label,
  features,
  specifications,
  dimensions,
  material,
  delivery_info,
  stock_quantity,
  availability_status,
  is_featured,
  is_trending,
  is_bestseller,
  is_active,
  request_quote_only
) VALUES (
  'EVERYDAY',
  (SELECT id FROM categories WHERE slug = 'home-accessories' LIMIT 1),
  'Foldable Wall-Mounted Ironing Table',
  'foldable-wall-mounted-ironing-table',
  'FRC-EW-IRT-001',
  'A space-saving, durable and stylish solution for everyday ironing.',
  'Designed specifically for modern apartments and compact homes in Kerala, the Furcho Foldable Wall-Mounted Ironing Table features a wide rectangular ivory/beige padded tabletop mounted securely on the wall with heavy-duty black metal folding support brackets underneath. When not in use, the tabletop folds vertically to sit flush and upright against the wall.',
  299900,
  NULL,
  'Launch Price',
  '["Space Saving", "Sturdy & Durable", "Easy Installation", "Foldable Design"]'::jsonb,
  '{"Mounting Type": "Wall-Mounted with Folding Brackets", "Tabletop Style": "Wide Rectangular Ivory/Beige Padded Surface", "Support Mechanism": "Black Powder-Coated Metal Folding Brackets", "Folded Orientation": "Folds Vertically Upright Against Wall"}'::jsonb,
  NULL,
  NULL,
  'Delivery charges confirmed based on customer district and PIN code across Kerala.',
  25,
  'IN_STOCK',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE
) ON CONFLICT (slug) DO NOTHING;
