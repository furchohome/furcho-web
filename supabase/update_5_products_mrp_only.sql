-- =========================================================================
-- SAFE PRODUCT UPDATE SCRIPT (Touches ONLY these 5 products, nothing else!)
-- =========================================================================
-- This script does NOT touch your real products, orders, customers, or settings.
-- It only sets the MRP (original_price_paise) and removes the 'Demo Listing' badge
-- for the 5 initial catalogue reference items.

UPDATE public.products 
SET 
  original_price_paise = 199900, 
  launch_price_label = NULL, 
  is_demo_data = FALSE 
WHERE id = 'prod-wall-mounted-shelf' OR slug = 'wall-mounted-shelf';

UPDATE public.products 
SET 
  original_price_paise = 599900, 
  launch_price_label = NULL, 
  is_demo_data = FALSE 
WHERE id = 'prod-kitchen-utility-table' OR slug = 'wooden-kitchen-utility-table';

UPDATE public.products 
SET 
  original_price_paise = 329900, 
  launch_price_label = NULL, 
  is_demo_data = FALSE 
WHERE id = 'prod-compact-shoe-rack' OR slug = 'compact-shoe-rack';

UPDATE public.products 
SET 
  original_price_paise = 299900, 
  launch_price_label = NULL, 
  is_demo_data = FALSE 
WHERE id = 'prod-bedside-table' OR slug = 'bedside-table';

UPDATE public.products 
SET 
  original_price_paise = 249900, 
  launch_price_label = NULL, 
  is_demo_data = FALSE 
WHERE id = 'prod-kitchen-spice-organizer' OR slug = 'floating-kitchen-jar-spice-shelf-set';
