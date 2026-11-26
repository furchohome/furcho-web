// ============================================================================
// FURCHO E-COMMERCE PLATFORM - STRICT TYPESCRIPT DOMAIN MODELS
// Money values are stored in integer paise (e.g. ₹2,999 = 299900 paise)
// ============================================================================

export type StoreSectionCode = "EVERYDAY" | "PREMIUM";

export type OrderStatus =
  | "PENDING"
  | "CONTACTED"
  | "CONFIRMED"
  | "PROCESSING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "DISCUSSION"
  | "QUOTATION_SENT"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED";

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface StoreSection {
  id: string;
  code: StoreSectionCode;
  name: string;
  tagline: string;
  description: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  store_section: StoreSectionCode;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  banner_url?: string;
  display_order: number;
  is_active: boolean;
  subcategories?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  view_label?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price_override_paise: number | null;
  finish_or_color?: string;
  dimensions?: string;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductReview {
  id: string;
  author_name: string;
  district: string;
  rating: number;
  comment: string;
  verified_buyer: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  store_section: StoreSectionCode;
  category_id: string;
  category_slug: string;
  category_name: string;
  subcategory_name?: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  selling_price_paise: number;
  original_price_paise: number | null;
  launch_price_label?: string | null;
  features: string[];
  specifications: Record<string, string>;
  dimensions: string | null;
  material: string | null;
  delivery_info: string;
  stock_quantity: number;
  availability_status: "IN_STOCK" | "LOW_STOCK" | "MADE_TO_ORDER" | "OUT_OF_STOCK";
  is_featured: boolean;
  is_trending: boolean;
  is_bestseller: boolean;
  is_demo_data: boolean;
  is_active: boolean;
  request_quote_only: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: ProductReview[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  sku: string;
  image_url: string;
  unit_price_paise: number;
  quantity: number;
  variant_id?: string | null;
  variant_name?: string | null;
  store_section: StoreSectionCode;
  max_stock: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id?: string | null;
  product_name_snapshot: string;
  product_sku_snapshot: string;
  selected_variant_snapshot?: string | null;
  product_image_snapshot?: string;
  unit_price_paise: number;
  quantity: number;
  line_total_paise: number;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  note: string;
  changed_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  district: string;
  city_town: string;
  full_address: string;
  pincode: string;
  delivery_instructions?: string;
  status: OrderStatus;
  subtotal_paise: number;
  delivery_charge_paise: number | null;
  confirmed_payable_paise: number | null;
  total_paise: number;
  payment_method: "ORDER_REQUEST" | "RAZORPAY_FUTURE";
  payment_status: "UNPAID" | "PAID" | "REFUNDED";
  internal_notes?: string;
  is_purchase_tracked: boolean;
  items: OrderItem[];
  status_history: OrderStatusHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  district: string;
  city: string;
  full_address?: string;
  pincode?: string;
  total_orders: number;
  total_enquiries: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EnquiryAttachment {
  id: string;
  enquiry_id: string;
  file_url: string;
  file_name: string;
  file_type?: string;
  created_at: string;
}

export interface FollowUpEntry {
  id: string;
  note: string;
  author: string;
  created_at: string;
}

export interface Enquiry {
  id: string;
  enquiry_number: string;
  customer_id?: string;
  customer_name: string;
  mobile_number: string;
  email?: string;
  store_section: StoreSectionCode;
  enquiry_category: string;
  product_reference?: string;
  requirement_description: string;
  preferred_dimensions?: string;
  material_finish?: string;
  budget_range?: string;
  project_location: string;
  status: EnquiryStatus;
  assigned_staff?: string;
  internal_notes?: string;
  follow_up_history: FollowUpEntry[];
  attachments: EnquiryAttachment[];
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  enquiry_id: string;
  enquiry_number: string;
  customer_name: string;
  customer_phone: string;
  store_section: StoreSectionCode;
  title: string;
  quoted_amount_paise: number;
  valid_until: string;
  document_url?: string;
  summary_notes: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  placement: "HERO" | "CATEGORY" | "PREMIUM_PROMO" | "COMMERCIAL_PROMO" | "CUSTOM_PROMO";
  store_section: StoreSectionCode;
  product_id?: string | null;
  product_slug?: string | null;
  title: string;
  subtitle: string;
  badge_text?: string;
  price_paise?: number | null;
  launch_price_label?: string | null;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  image_url: string;
  mobile_image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryRule {
  id: string;
  district: string;
  estimated_charge_paise: number | null;
  free_delivery_threshold_paise: number | null;
  estimated_days: string;
  notes: string;
  is_active: boolean;
}

export interface SiteSettings {
  id: string;
  announcement_text: string;
  announcement_badge: string;
  announcement_enabled: boolean;
  featured_product_slug: string;
  promo_price_paise: number;
  promo_countdown_end: string | null;
  promo_countdown_hours?: number;
  whatsapp_number: string;
  support_phone: string;
  support_email: string;
  meta_pixel_id: string;
  footer_tagline: string;
  address_line: string;
  hero_bg_image?: string;
  hero_mobile_image?: string;
  updated_at: string;
}
