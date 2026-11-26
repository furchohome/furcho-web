import { createClient } from "@supabase/supabase-js";
import { INITIAL_DB_STATE, FurchoDatabaseState } from "./initial-data";
import {
  Banner,
  Category,
  Customer,
  Enquiry,
  EnquiryAttachment,
  EnquiryStatus,
  FollowUpEntry,
  Order,
  OrderStatus,
  Product,
  ProductReview,
  Quotation,
  SiteSettings,
  StoreSectionCode,
} from "@/types/database";

/**
 * Direct Supabase Client:
 * Uses service role key when present (for admin bypass), otherwise uses publishable key.
 * With RLS disabled via migration SQL, this client performs direct SELECT, INSERT, UPDATE, DELETE on Supabase.
 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ifyqwoeakglzflvemwtp.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured. Missing URL or API key.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getFullDbState(): Promise<FurchoDatabaseState> {
  const supabase = getSupabaseClient();

  const [
    settingsRes,
    categoriesRes,
    productsRes,
    bannersRes,
    ordersRes,
    customersRes,
    enquiriesRes,
    quotationsRes,
  ] = await Promise.all([
    supabase.from("site_settings").select("*").limit(1).maybeSingle(),
    supabase.from("categories").select("*").order("display_order", { ascending: true }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("banners").select("*").order("display_order", { ascending: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
    supabase.from("quotations").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    store_sections: INITIAL_DB_STATE.store_sections,
    delivery_rules: INITIAL_DB_STATE.delivery_rules,
    site_settings: (settingsRes.data as SiteSettings) || INITIAL_DB_STATE.site_settings,
    categories: (categoriesRes.data as Category[]) || [],
    products: (productsRes.data as Product[]) || [],
    banners: (bannersRes.data as Banner[]) || [],
    orders: (ordersRes.data as Order[]) || [],
    customers: (customersRes.data as Customer[]) || [],
    enquiries: (enquiriesRes.data as Enquiry[]) || [],
    quotations: (quotationsRes.data as Quotation[]) || [],
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error || !data) {
    return INITIAL_DB_STATE.site_settings;
  }
  return data as SiteSettings;
}

export async function updateSiteSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = getSupabaseClient();
  const current = await getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...partial,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(updated)
    .select()
    .single();

  if (error) {
    // If promo_countdown_hours column is not yet in Supabase table, retry without it
    if (error.message && error.message.includes("promo_countdown_hours")) {
      const fallback = { ...updated };
      delete fallback.promo_countdown_hours;
      const retryRes = await supabase
        .from("site_settings")
        .upsert(fallback)
        .select()
        .single();
      if (!retryRes.error && retryRes.data) {
        return retryRes.data as SiteSettings;
      }
    }
    throw new Error(`Failed to update site settings in Supabase: ${error.message}`);
  }
  return data as SiteSettings;
}

export async function getCategories(section?: StoreSectionCode, includeInactive = false): Promise<Category[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("categories").select("*").order("display_order", { ascending: true });

  if (section) {
    query = query.eq("store_section", section);
  }
  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Supabase getCategories error:", error);
    return [];
  }
  return (data as Category[]) || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return undefined;
  return data as Category;
}

export async function upsertCategory(
  category: Partial<Category> & { name: string; slug: string; store_section: StoreSectionCode }
): Promise<Category> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  let targetId = category.id;
  if (!targetId) {
    const existing = await getCategoryBySlug(category.slug);
    targetId = existing?.id || `cat-${Date.now()}`;
  }

  const payload: Category = {
    id: targetId,
    store_section: category.store_section,
    parent_id: category.parent_id || null,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    image_url: category.image_url || "/images/categories/kitchen.jpg",
    banner_url: category.banner_url || category.image_url || "/images/categories/kitchen.jpg",
    display_order: category.display_order ?? 1,
    is_active: category.is_active ?? true,
    subcategories: category.subcategories || [],
    created_at: category.created_at || now,
    updated_at: now,
  };

  const { data, error } = await supabase.from("categories").upsert(payload).select().single();
  if (error) {
    throw new Error(`Failed to save category to Supabase: ${error.message}`);
  }
  return data as Category;
}

export async function deleteCategoryById(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete category from Supabase: ${error.message}`);
  }
  return true;
}

export async function getProducts(options?: {
  section?: StoreSectionCode;
  categorySlug?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestseller?: boolean;
  includeInactive?: boolean;
}): Promise<Product[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (options?.section) query = query.eq("store_section", options.section);
  if (options?.categorySlug) query = query.eq("category_slug", options.categorySlug);
  if (options?.isFeatured) query = query.eq("is_featured", true);
  if (options?.isTrending) query = query.eq("is_trending", true);
  if (options?.isBestseller) query = query.eq("is_bestseller", true);
  if (!options?.includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) {
    console.error("Supabase getProducts error:", error);
    return [];
  }
  return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return undefined;
  return data as Product;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return data as Product;
}

export async function upsertProduct(productInput: Partial<Product> & { name: string; slug: string }): Promise<Product> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  let targetId = productInput.id;
  if (!targetId) {
    const existing = await getProductBySlug(productInput.slug);
    targetId = existing?.id || `prod-${Date.now()}`;
  }

  const payload: Product = {
    id: targetId,
    store_section: productInput.store_section || "EVERYDAY",
    category_id: productInput.category_id || "",
    category_slug: productInput.category_slug || "",
    category_name: productInput.category_name || "",
    subcategory_name: productInput.subcategory_name,
    name: productInput.name,
    slug: productInput.slug,
    sku: productInput.sku || `SKU-${Date.now()}`,
    short_description: productInput.short_description || "",
    description: productInput.description || "",
    selling_price_paise: productInput.selling_price_paise ?? 0,
    original_price_paise: productInput.original_price_paise ?? null,
    launch_price_label: productInput.launch_price_label,
    features: productInput.features || [],
    specifications: productInput.specifications || {},
    dimensions: productInput.dimensions ?? null,
    material: productInput.material ?? null,
    delivery_info: productInput.delivery_info || "100% Free Doorstep Delivery across Kerala.",
    stock_quantity: productInput.stock_quantity ?? 10,
    availability_status: productInput.availability_status || "IN_STOCK",
    is_featured: productInput.is_featured ?? false,
    is_trending: productInput.is_trending ?? false,
    is_bestseller: productInput.is_bestseller ?? false,
    is_demo_data: false,
    is_active: productInput.is_active ?? true,
    request_quote_only: productInput.request_quote_only ?? false,
    images: productInput.images || [],
    variants: productInput.variants || [],
    reviews: productInput.reviews || [],
    created_at: productInput.created_at || now,
    updated_at: now,
  };

  const { data, error } = await supabase.from("products").upsert(payload).select().single();
  if (error) {
    throw new Error(`Failed to save product to Supabase: ${error.message}`);
  }
  return data as Product;
}

export async function deleteProductById(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete product from Supabase: ${error.message}`);
  }
  return true;
}

export async function addProductReview(
  productId: string,
  reviewInput: {
    author_name: string;
    district?: string;
    rating: number;
    comment: string;
  }
): Promise<ProductReview> {
  const supabase = getSupabaseClient();
  const product = await getProductById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author_name: reviewInput.author_name.trim(),
    district: reviewInput.district ? reviewInput.district.trim() : undefined,
    rating: Math.max(1, Math.min(5, Math.round(reviewInput.rating))),
    comment: reviewInput.comment.trim(),
    verified_buyer: true,
    created_at: new Date().toISOString(),
  };

  const updatedReviews = [newReview, ...(product.reviews || [])];

  const { error } = await supabase
    .from("products")
    .update({ reviews: updatedReviews, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (error) {
    throw new Error(`Failed to add review: ${error.message}`);
  }

  return newReview;
}

export async function deleteProductReview(
  productId: string,
  reviewId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const product = await getProductById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const updatedReviews = (product.reviews || []).filter((r) => r.id !== reviewId);

  const { error } = await supabase
    .from("products")
    .update({ reviews: updatedReviews, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`);
  }

  return true;
}

export async function getBanners(includeInactive = false): Promise<Banner[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("banners").select("*").order("display_order", { ascending: true });
  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Supabase getBanners error:", error);
    return [];
  }
  return (data as Banner[]) || [];
}

export async function upsertBanner(bannerInput: Partial<Banner> & { title: string; image_url: string }): Promise<Banner> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const payload: Banner = {
    id: bannerInput.id || `ban-${Date.now()}`,
    placement: bannerInput.placement || "HERO",
    store_section: bannerInput.store_section || "EVERYDAY",
    product_id: bannerInput.product_id || null,
    product_slug: bannerInput.product_slug || null,
    title: bannerInput.title,
    subtitle: bannerInput.subtitle || "",
    badge_text: bannerInput.badge_text || "",
    price_paise: bannerInput.price_paise !== undefined ? bannerInput.price_paise : null,
    launch_price_label: bannerInput.launch_price_label || null,
    cta_primary_text: bannerInput.cta_primary_text || "Explore Now",
    cta_primary_link: bannerInput.cta_primary_link || "/",
    cta_secondary_text: bannerInput.cta_secondary_text,
    cta_secondary_link: bannerInput.cta_secondary_link,
    image_url: bannerInput.image_url,
    mobile_image_url: bannerInput.mobile_image_url || bannerInput.image_url,
    display_order: bannerInput.display_order ?? 1,
    is_active: bannerInput.is_active ?? true,
    created_at: bannerInput.created_at || now,
    updated_at: now,
  };

  const { data, error } = await supabase.from("banners").upsert(payload).select().single();
  if (error) {
    throw new Error(`Failed to save banner to Supabase: ${error.message}`);
  }
  return data as Banner;
}

export async function deleteBannerById(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete banner from Supabase: ${error.message}`);
  }
  return true;
}

export async function createOrderRequest(payload: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  district: string;
  city_town: string;
  full_address: string;
  pincode: string;
  delivery_instructions?: string;
  items: { product_id: string; variant_id?: string | null; quantity: number }[];
}): Promise<Order> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (!payload.items || payload.items.length === 0) {
    throw new Error("Cannot submit an empty order request.");
  }

  const products = await getProducts({ includeInactive: false });

  const orderId = `ord-${Date.now()}`;
  const orderNumber = `FRC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let subtotalPaise = 0;
  const orderItems = payload.items.map((reqItem, index) => {
    const product = products.find(
      (p) => (p.id === reqItem.product_id || p.slug === reqItem.product_id) && p.is_active
    );
    if (!product) {
      throw new Error(`Product ${reqItem.product_id} is currently unavailable.`);
    }

    const variant = reqItem.variant_id
      ? product.variants.find((v) => v.id === reqItem.variant_id)
      : product.variants[0];

    const unitPricePaise = variant?.price_override_paise ?? product.selling_price_paise;
    const qty = Math.max(1, Math.floor(reqItem.quantity));
    const lineTotalPaise = unitPricePaise * qty;
    subtotalPaise += lineTotalPaise;

    return {
      id: `oi-${Date.now()}-${index}`,
      order_id: orderId,
      product_id: product.id,
      variant_id: variant?.id || null,
      product_name_snapshot: product.name,
      product_sku_snapshot: variant?.sku || product.sku,
      selected_variant_snapshot: variant?.name || null,
      product_image_snapshot: product.images[0]?.image_url || "/images/products/ironing-table-hero.jpg",
      unit_price_paise: unitPricePaise,
      quantity: qty,
      line_total_paise: lineTotalPaise,
    };
  });

  // Customer upsert
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", payload.customer_phone)
    .maybeSingle();

  const customerId = existingCustomer?.id || `cust-${Date.now()}`;
  const customerPayload: Customer = {
    id: customerId,
    full_name: payload.customer_name,
    phone: payload.customer_phone,
    email: payload.customer_email || existingCustomer?.email || "",
    district: payload.district || "Kerala",
    city: payload.city_town || "",
    full_address: payload.full_address,
    pincode: payload.pincode,
    total_orders: (existingCustomer?.total_orders || 0) + 1,
    total_enquiries: existingCustomer?.total_enquiries || 0,
    notes: existingCustomer?.notes || "",
    created_at: existingCustomer?.created_at || now,
    updated_at: now,
  };
  await supabase.from("customers").upsert(customerPayload);

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_id: customerId,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    customer_email: payload.customer_email,
    district: payload.district || "Kerala",
    city_town: payload.city_town || "",
    full_address: payload.full_address,
    pincode: payload.pincode,
    delivery_instructions: payload.delivery_instructions,
    status: "PENDING",
    subtotal_paise: subtotalPaise,
    delivery_charge_paise: null,
    confirmed_payable_paise: null,
    total_paise: subtotalPaise,
    payment_method: "ORDER_REQUEST",
    payment_status: "UNPAID",
    internal_notes: "",
    is_purchase_tracked: false,
    items: orderItems,
    status_history: [
      {
        id: `osh-${Date.now()}`,
        order_id: orderId,
        previous_status: null,
        new_status: "PENDING",
        note: "Order request submitted by customer. Awaiting admin availability verification.",
        changed_by: "Customer Checkout",
        created_at: now,
      },
    ],
    created_at: now,
    updated_at: now,
  };

  const { data: createdOrder, error: orderError } = await supabase
    .from("orders")
    .insert(newOrder)
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order in Supabase: ${orderError.message}`);
  }
  return createdOrder as Order;
}

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase getOrders error:", error);
    return [];
  }
  return (data as Order[]) || [];
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .or(`order_number.eq.${orderNumber},id.eq.${orderNumber}`)
    .maybeSingle();

  if (error || !data) return undefined;
  return data as Order;
}

export async function updateOrderByAdmin(
  orderId: string,
  updates: {
    status?: OrderStatus;
    delivery_charge_paise?: number | null;
    confirmed_payable_paise?: number | null;
    internal_notes?: string;
    status_note?: string;
  }
): Promise<Order> {
  const supabase = getSupabaseClient();
  const existing = await getOrderByNumber(orderId);
  if (!existing) {
    throw new Error("Order not found.");
  }

  const now = new Date().toISOString();
  const previousStatus = existing.status;
  const newStatus = updates.status || previousStatus;

  const history = [...existing.status_history];
  if (updates.status && updates.status !== previousStatus) {
    history.push({
      id: `osh-${Date.now()}`,
      order_id: existing.id,
      previous_status: previousStatus,
      new_status: newStatus,
      note: updates.status_note || `Status changed from ${previousStatus} to ${newStatus} by admin`,
      changed_by: "Admin Desk",
      created_at: now,
    });
  }

  const updatedOrder: Order = {
    ...existing,
    status: newStatus,
    delivery_charge_paise:
      updates.delivery_charge_paise !== undefined ? updates.delivery_charge_paise : existing.delivery_charge_paise,
    confirmed_payable_paise:
      updates.confirmed_payable_paise !== undefined ? updates.confirmed_payable_paise : existing.confirmed_payable_paise,
    internal_notes: updates.internal_notes !== undefined ? updates.internal_notes : existing.internal_notes,
    status_history: history,
    updated_at: now,
  };

  const { data, error } = await supabase.from("orders").upsert(updatedOrder).select().single();
  if (error) {
    throw new Error(`Failed to update order in Supabase: ${error.message}`);
  }
  return data as Order;
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase getCustomers error:", error);
    return [];
  }
  return (data as Customer[]) || [];
}

export async function createCustomEnquiry(payload: {
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
  attachment_urls?: string[];
}): Promise<Enquiry> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const enquiryId = `enq-${Date.now()}`;
  const enquiryNumber = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Customer upsert
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", payload.mobile_number)
    .maybeSingle();

  const customerId = existingCustomer?.id || `cust-${Date.now()}`;
  await supabase.from("customers").upsert({
    id: customerId,
    full_name: payload.customer_name,
    phone: payload.mobile_number,
    email: payload.email || existingCustomer?.email || "",
    district: "Kerala",
    city: "Kerala",
    total_orders: existingCustomer?.total_orders || 0,
    total_enquiries: (existingCustomer?.total_enquiries || 0) + 1,
    notes: existingCustomer?.notes || "",
    created_at: existingCustomer?.created_at || now,
    updated_at: now,
  });

  const attachments: EnquiryAttachment[] = (payload.attachment_urls || []).map((url, i) => ({
    id: `att-${Date.now()}-${i}`,
    enquiry_id: enquiryId,
    file_name: `Attachment-${i + 1}`,
    file_url: url,
    created_at: now,
  }));

  const followUp: FollowUpEntry[] = [
    {
      id: `fuh-${Date.now()}`,
      author: "System Intake",
      note: "Enquiry submitted via storefront.",
      created_at: now,
    },
  ];

  const newEnquiry: Enquiry = {
    id: enquiryId,
    enquiry_number: enquiryNumber,
    customer_id: customerId,
    customer_name: payload.customer_name,
    mobile_number: payload.mobile_number,
    email: payload.email,
    store_section: payload.store_section,
    enquiry_category: payload.enquiry_category,
    product_reference: payload.product_reference,
    requirement_description: payload.requirement_description,
    preferred_dimensions: payload.preferred_dimensions,
    material_finish: payload.material_finish,
    budget_range: payload.budget_range,
    project_location: "Kerala",
    status: "NEW",
    assigned_staff: "Senior Interior Consultant",
    internal_notes: "",
    follow_up_history: followUp,
    attachments,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from("enquiries").insert(newEnquiry).select().single();
  if (error) {
    throw new Error(`Failed to create enquiry in Supabase: ${error.message}`);
  }
  return data as Enquiry;
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase getEnquiries error:", error);
    return [];
  }
  return (data as Enquiry[]) || [];
}

export async function getEnquiryById(id: string): Promise<Enquiry | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .or(`id.eq.${id},enquiry_number.eq.${id}`)
    .maybeSingle();

  if (error || !data) return undefined;
  return data as Enquiry;
}

export async function updateEnquiryByAdmin(
  enquiryId: string,
  updates: {
    status?: EnquiryStatus;
    assigned_staff?: string;
    internal_notes?: string;
    follow_up_note?: string;
    follow_up_channel?: "PHONE" | "WHATSAPP" | "SITE_VISIT" | "EMAIL";
  }
): Promise<Enquiry> {
  const supabase = getSupabaseClient();
  const existing = await getEnquiryById(enquiryId);
  if (!existing) {
    throw new Error("Enquiry not found.");
  }

  const now = new Date().toISOString();
  const history = [...existing.follow_up_history];

  if (updates.follow_up_note) {
    history.push({
      id: `fuh-${Date.now()}`,
      author: updates.assigned_staff || existing.assigned_staff || "Admin Desk",
      note: `[${updates.follow_up_channel || "PHONE"}] ${updates.follow_up_note}`,
      created_at: now,
    });
  }

  const updated: Enquiry = {
    ...existing,
    status: updates.status || existing.status,
    assigned_staff: updates.assigned_staff !== undefined ? updates.assigned_staff : existing.assigned_staff,
    internal_notes: updates.internal_notes !== undefined ? updates.internal_notes : existing.internal_notes,
    follow_up_history: history,
    updated_at: now,
  };

  const { data, error } = await supabase.from("enquiries").upsert(updated).select().single();
  if (error) {
    throw new Error(`Failed to update enquiry in Supabase: ${error.message}`);
  }
  return data as Enquiry;
}

export async function getQuotations(): Promise<Quotation[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("quotations").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase getQuotations error:", error);
    return [];
  }
  return (data as Quotation[]) || [];
}

export async function getQuotationById(id: string): Promise<Quotation | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .or(`id.eq.${id},quotation_number.eq.${id}`)
    .maybeSingle();

  if (error || !data) return undefined;
  return data as Quotation;
}

export async function createOrUpdateQuotation(input: {
  id?: string;
  enquiry_id: string;
  title: string;
  quoted_amount_paise: number;
  valid_until: string;
  document_url?: string;
  summary_notes?: string;
  status?: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
}): Promise<Quotation> {
  const supabase = getSupabaseClient();
  const enquiry = await getEnquiryById(input.enquiry_id);
  const now = new Date().toISOString();

  let existing: Quotation | undefined;
  if (input.id) {
    existing = await getQuotationById(input.id);
  }

  const payload: Quotation = {
    id: input.id || existing?.id || `quot-${Date.now()}`,
    quotation_number: existing?.quotation_number || `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
    enquiry_id: input.enquiry_id,
    enquiry_number: enquiry?.enquiry_number || "",
    customer_name: enquiry?.customer_name || "",
    customer_phone: enquiry?.mobile_number || "",
    store_section: enquiry?.store_section || "PREMIUM",
    title: input.title,
    quoted_amount_paise: input.quoted_amount_paise,
    valid_until: input.valid_until,
    document_url: input.document_url,
    summary_notes: input.summary_notes || "",
    status: input.status || existing?.status || "DRAFT",
    created_by: "Admin Desk",
    created_at: existing?.created_at || now,
    updated_at: now,
  };

  const { data, error } = await supabase.from("quotations").upsert(payload).select().single();
  if (error) {
    throw new Error(`Failed to save quotation to Supabase: ${error.message}`);
  }
  return data as Quotation;
}

export async function deleteQuotationById(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete quotation from Supabase: ${error.message}`);
  }
  return true;
}
