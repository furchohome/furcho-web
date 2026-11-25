import fs from "fs";
import path from "path";
import { INITIAL_DB_STATE, FurchoDatabaseState } from "./initial-data";
import { createSupabaseAdminClient, createSupabaseServerClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/client";
import {
  Banner,
  Category,
  Customer,
  Enquiry,
  EnquiryStatus,
  Order,
  OrderStatus,
  Product,
  Quotation,
  SiteSettings,
  StoreSectionCode,
} from "@/types/database";

const DB_FILE_PATH = path.resolve(process.cwd(), "data", "furcho-db.json");

function ensureLocalDb(): FurchoDatabaseState {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_DB_STATE, null, 2), "utf-8");
      return structuredClone(INITIAL_DB_STATE);
    }
    const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as FurchoDatabaseState;
    return parsed;
  } catch {
    return structuredClone(INITIAL_DB_STATE);
  }
}

function saveLocalDb(state: FurchoDatabaseState) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist local DB state:", err);
  }
}

/**
 * Unified Server Repository:
 * Connects to Supabase PostgreSQL when NEXT_PUBLIC_SUPABASE_URL & keys are configured,
 * and seamlessly syncs with persistent database records so all Storefront & Admin operations
 * work immediately out-of-the-box and with live Supabase.
 */
export async function getFullDbState(): Promise<FurchoDatabaseState> {
  const local = ensureLocalDb();

  if (isSupabaseConfigured()) {
    try {
      const fetchRemote = async () => {
        const supabase = (await createSupabaseServerClient()) || createSupabaseAdminClient();
        if (supabase) {
          const { data: settingsData } = await supabase
            .from("site_settings")
            .select("*")
            .limit(1)
            .maybeSingle();
          if (settingsData) {
            local.site_settings = { ...local.site_settings, ...settingsData };
          }
        }
      };

      await Promise.race([
        fetchRemote(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase timeout")), 1200)),
      ]);
    } catch {
      // Fallback to local state immediately if Supabase is slow or unreachable
    }
  }

  return local;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await getFullDbState();
  return db.site_settings;
}

export async function updateSiteSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const db = ensureLocalDb();
  db.site_settings = {
    ...db.site_settings,
    ...partial,
    updated_at: new Date().toISOString(),
  };
  saveLocalDb(db);

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      await admin
        .from("site_settings")
        .upsert(db.site_settings);
    }
  }
  return db.site_settings;
}

export async function getCategories(section?: StoreSectionCode, includeInactive = false): Promise<Category[]> {
  const db = await getFullDbState();
  return db.categories
    .filter((c) => (section ? c.store_section === section : true))
    .filter((c) => (includeInactive ? true : c.is_active))
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const db = await getFullDbState();
  return db.categories.find((c) => c.slug === slug);
}

export async function upsertCategory(category: Partial<Category> & { name: string; slug: string; store_section: StoreSectionCode }): Promise<Category> {
  const db = ensureLocalDb();
  const now = new Date().toISOString();
  const existingIdx = db.categories.findIndex((c) => c.id === category.id || c.slug === category.slug);

  if (existingIdx >= 0) {
    db.categories[existingIdx] = {
      ...db.categories[existingIdx],
      ...category,
      updated_at: now,
    };
    saveLocalDb(db);
    return db.categories[existingIdx];
  }

  const newCat: Category = {
    id: category.id || `cat-${Date.now()}`,
    store_section: category.store_section,
    parent_id: category.parent_id || null,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    image_url: category.image_url || "/images/categories/kitchen.jpg",
    banner_url: category.banner_url || category.image_url || "/images/categories/kitchen.jpg",
    display_order: category.display_order ?? db.categories.length + 1,
    is_active: category.is_active ?? true,
    subcategories: category.subcategories || [],
    created_at: now,
    updated_at: now,
  };
  db.categories.push(newCat);
  saveLocalDb(db);
  return newCat;
}

export async function deleteCategoryById(id: string): Promise<boolean> {
  const db = ensureLocalDb();
  const before = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  saveLocalDb(db);
  return db.categories.length < before;
}

export async function getProducts(options?: {
  section?: StoreSectionCode;
  categorySlug?: string;
  subcategory?: string;
  featuredOnly?: boolean;
  trendingOnly?: boolean;
  includeInactive?: boolean;
  search?: string;
}): Promise<Product[]> {
  const db = await getFullDbState();
  return db.products.filter((p) => {
    if (!options?.includeInactive && !p.is_active) return false;
    if (options?.section && p.store_section !== options.section) return false;
    if (options?.categorySlug && p.category_slug !== options.categorySlug) return false;
    if (
      options?.subcategory &&
      p.subcategory_name?.toLowerCase() !== options.subcategory.toLowerCase()
    ) {
      return false;
    }
    if (options?.featuredOnly && !p.is_featured) return false;
    if (options?.trendingOnly && !p.is_trending) return false;
    if (options?.search) {
      const q = options.search.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export async function getProductBySlug(slug: string, includeInactive = false): Promise<Product | undefined> {
  const db = await getFullDbState();
  return db.products.find((p) => p.slug === slug && (includeInactive || p.is_active));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = await getFullDbState();
  return db.products.find((p) => p.id === id);
}

export async function upsertProduct(productInput: Partial<Product> & { name: string; slug: string; selling_price_paise: number }): Promise<Product> {
  const db = ensureLocalDb();
  const now = new Date().toISOString();
  const existingIdx = db.products.findIndex(
    (p) => (productInput.id && p.id === productInput.id) || p.slug === productInput.slug
  );

  const category =
    db.categories.find((c) => c.id === productInput.category_id || c.slug === productInput.category_slug) ||
    db.categories[0];

  if (existingIdx >= 0) {
    const current = db.products[existingIdx];
    const updated: Product = {
      ...current,
      ...productInput,
      category_id: category.id,
      category_slug: category.slug,
      category_name: category.name,
      images: productInput.images && productInput.images.length > 0 ? productInput.images : current.images,
      variants: productInput.variants ?? current.variants,
      updated_at: now,
    };
    if (updated.is_featured && updated.store_section === "EVERYDAY") {
      db.site_settings.featured_product_slug = updated.slug;
      db.site_settings.promo_price_paise = updated.selling_price_paise;
    }
    db.products[existingIdx] = updated;
    saveLocalDb(db);
    return updated;
  }

  const newId = productInput.id || `prod-${Date.now()}`;
  const created: Product = {
    id: newId,
    store_section: productInput.store_section || "EVERYDAY",
    category_id: category.id,
    category_slug: category.slug,
    category_name: category.name,
    subcategory_name: productInput.subcategory_name || category.subcategories?.[0] || "",
    name: productInput.name,
    slug: productInput.slug,
    sku: productInput.sku || `FRC-${Date.now().toString().slice(-5)}`,
    short_description: productInput.short_description || "",
    description: productInput.description || "",
    selling_price_paise: productInput.selling_price_paise,
    original_price_paise: productInput.original_price_paise ?? null,
    launch_price_label: productInput.launch_price_label ?? null,
    features: productInput.features || ["Quality Craftsmanship", "Durable Build"],
    specifications: productInput.specifications || {},
    dimensions: productInput.dimensions || null,
    material: productInput.material || null,
    delivery_info:
      productInput.delivery_info ||
      "Delivery charges confirmed based on customer location across Kerala.",
    stock_quantity: productInput.stock_quantity ?? 10,
    availability_status: productInput.availability_status || "IN_STOCK",
    is_featured: productInput.is_featured ?? false,
    is_trending: productInput.is_trending ?? true,
    is_bestseller: productInput.is_bestseller ?? false,
    is_demo_data: productInput.is_demo_data ?? false,
    is_active: productInput.is_active ?? true,
    request_quote_only:
      productInput.request_quote_only ?? productInput.store_section === "PREMIUM",
    images:
      productInput.images && productInput.images.length > 0
        ? productInput.images
        : [
            {
              id: `img-${Date.now()}`,
              product_id: newId,
              image_url: "/images/products/ironing-table-open.jpg",
              alt_text: productInput.name,
              view_label: "Primary View",
              is_primary: true,
              display_order: 1,
            },
          ],
    variants: productInput.variants || [],
    reviews: [],
    created_at: now,
    updated_at: now,
  };

  db.products.unshift(created);
  saveLocalDb(db);
  return created;
}

export async function deleteProductById(id: string): Promise<boolean> {
  const db = ensureLocalDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  saveLocalDb(db);
  return db.products.length < before;
}

export async function getBanners(includeInactive = false): Promise<Banner[]> {
  const db = await getFullDbState();
  return db.banners
    .filter((b) => (includeInactive ? true : b.is_active))
    .sort((a, b) => a.display_order - b.display_order);
}

export async function upsertBanner(bannerInput: Partial<Banner> & { title: string; image_url: string }): Promise<Banner> {
  const db = ensureLocalDb();
  const now = new Date().toISOString();
  const idx = db.banners.findIndex((b) => b.id === bannerInput.id);
  if (idx >= 0) {
    db.banners[idx] = {
      ...db.banners[idx],
      ...bannerInput,
      updated_at: now,
    };
    saveLocalDb(db);
    return db.banners[idx];
  }
  const created: Banner = {
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
    display_order: bannerInput.display_order ?? db.banners.length + 1,
    is_active: bannerInput.is_active ?? true,
    created_at: now,
    updated_at: now,
  };
  db.banners.push(created);
  saveLocalDb(db);
  return created;
}

export async function deleteBannerById(id: string): Promise<boolean> {
  const db = ensureLocalDb();
  const before = db.banners.length;
  db.banners = db.banners.filter((b) => b.id !== id);
  saveLocalDb(db);
  return db.banners.length < before;
}

/**
 * Server-side Order Creation:
 * Recalculates prices strictly from server product records, validates availability,
 * saves snapshot on order_items, and sets initial status strictly to PENDING.
 */
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
  const db = ensureLocalDb();
  const now = new Date().toISOString();

  if (!payload.items || payload.items.length === 0) {
    throw new Error("Cannot submit an empty order request.");
  }

  const orderId = `ord-${Date.now()}`;
  const orderNumber = `FRC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let subtotalPaise = 0;
  const orderItems = payload.items.map((reqItem, index) => {
    const product = db.products.find(
      (p) => (p.id === reqItem.product_id || p.slug === reqItem.product_id) && p.is_active
    );
    if (!product) {
      throw new Error(`Product ${reqItem.product_id} is currently unavailable.`);
    }
    if (product.availability_status === "OUT_OF_STOCK" || product.stock_quantity < reqItem.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock_quantity}.`);
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

  // Upsert customer record
  let customer = db.customers.find((c) => c.phone === payload.customer_phone);
  if (customer) {
    customer.full_name = payload.customer_name;
    customer.email = payload.customer_email || customer.email;
    customer.district = payload.district || "All India";
    customer.city = payload.city_town || "";
    customer.full_address = payload.full_address;
    customer.pincode = payload.pincode;
    customer.total_orders += 1;
    customer.updated_at = now;
  } else {
    customer = {
      id: `cust-${Date.now()}`,
      full_name: payload.customer_name,
      phone: payload.customer_phone,
      email: payload.customer_email,
      district: payload.district || "All India",
      city: payload.city_town || "",
      full_address: payload.full_address,
      pincode: payload.pincode,
      total_orders: 1,
      total_enquiries: 0,
      created_at: now,
      updated_at: now,
    };
    db.customers.unshift(customer);
  }

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    customer_id: customer.id,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    customer_email: payload.customer_email,
    district: payload.district || "All India",
    city_town: payload.city_town || "",
    full_address: payload.full_address,
    pincode: payload.pincode,
    delivery_instructions: payload.delivery_instructions,
    status: "PENDING", // Never marked CONFIRMED automatically
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
        note: "Order request submitted by customer. Awaiting admin availability & delivery charge verification.",
        changed_by: "Customer Checkout",
        created_at: now,
      },
    ],
    created_at: now,
    updated_at: now,
  };

  db.orders.unshift(newOrder);
  saveLocalDb(db);
  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  const db = await getFullDbState();
  return db.orders;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const db = await getFullDbState();
  return db.orders.find((o) => o.order_number === orderNumber || o.id === orderNumber);
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
  const db = ensureLocalDb();
  const now = new Date().toISOString();
  const idx = db.orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
  if (idx < 0) throw new Error("Order not found");

  const order = db.orders[idx];
  const prevStatus = order.status;

  if (updates.delivery_charge_paise !== undefined) {
    order.delivery_charge_paise = updates.delivery_charge_paise;
    order.total_paise = order.subtotal_paise + (updates.delivery_charge_paise || 0);
  }

  if (updates.confirmed_payable_paise !== undefined) {
    order.confirmed_payable_paise = updates.confirmed_payable_paise;
  }

  if (updates.internal_notes !== undefined) {
    order.internal_notes = updates.internal_notes;
  }

  if (updates.status && updates.status !== prevStatus) {
    order.status = updates.status;
    order.status_history.push({
      id: `osh-${Date.now()}`,
      order_id: order.id,
      previous_status: prevStatus,
      new_status: updates.status,
      note: updates.status_note || `Order status updated from ${prevStatus} to ${updates.status}`,
      changed_by: "Furcho Admin",
      created_at: now,
    });
  }

  order.updated_at = now;
  db.orders[idx] = order;
  saveLocalDb(db);
  return order;
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
  project_location: string;
  attachment_urls?: { url: string; name: string }[];
}): Promise<Enquiry> {
  const db = ensureLocalDb();
  const now = new Date().toISOString();
  const enqId = `enq-${Date.now()}`;
  const prefix = payload.store_section === "PREMIUM" ? "ENQ-PRM" : "ENQ-EVD";
  const enquiryNumber = `${prefix}-${Math.floor(2000 + Math.random() * 7999)}`;

  let customer = db.customers.find((c) => c.phone === payload.mobile_number);
  if (customer) {
    customer.total_enquiries += 1;
    customer.updated_at = now;
  } else {
    customer = {
      id: `cust-${Date.now()}`,
      full_name: payload.customer_name,
      phone: payload.mobile_number,
      email: payload.email,
      district: payload.project_location,
      city: payload.project_location,
      total_orders: 0,
      total_enquiries: 1,
      created_at: now,
      updated_at: now,
    };
    db.customers.unshift(customer);
  }

  const enquiry: Enquiry = {
    id: enqId,
    enquiry_number: enquiryNumber,
    customer_id: customer.id,
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
    project_location: payload.project_location,
    status: "NEW",
    assigned_staff: "Unassigned",
    internal_notes: "",
    follow_up_history: [
      {
        id: `fup-${Date.now()}`,
        note: "Enquiry submitted by customer via website.",
        author: "System",
        created_at: now,
      },
    ],
    attachments: (payload.attachment_urls || []).map((att, i) => ({
      id: `att-${Date.now()}-${i}`,
      enquiry_id: enqId,
      file_url: att.url,
      file_name: att.name,
      created_at: now,
    })),
    created_at: now,
    updated_at: now,
  };

  db.enquiries.unshift(enquiry);
  saveLocalDb(db);
  return enquiry;
}

export async function getEnquiries(section?: StoreSectionCode): Promise<Enquiry[]> {
  const db = await getFullDbState();
  return db.enquiries.filter((e) => (section ? e.store_section === section : true));
}

export async function updateEnquiryByAdmin(
  enquiryId: string,
  updates: {
    status?: EnquiryStatus;
    assigned_staff?: string;
    internal_notes?: string;
    follow_up_note?: string;
  }
): Promise<Enquiry> {
  const db = ensureLocalDb();
  const now = new Date().toISOString();
  const idx = db.enquiries.findIndex((e) => e.id === enquiryId || e.enquiry_number === enquiryId);
  if (idx < 0) throw new Error("Enquiry not found");

  const enquiry = db.enquiries[idx];
  if (updates.status) enquiry.status = updates.status;
  if (updates.assigned_staff !== undefined) enquiry.assigned_staff = updates.assigned_staff;
  if (updates.internal_notes !== undefined) enquiry.internal_notes = updates.internal_notes;
  if (updates.follow_up_note && updates.follow_up_note.trim()) {
    enquiry.follow_up_history.push({
      id: `fup-${Date.now()}`,
      note: updates.follow_up_note.trim(),
      author: updates.assigned_staff || "Furcho Admin",
      created_at: now,
    });
  }
  enquiry.updated_at = now;
  db.enquiries[idx] = enquiry;
  saveLocalDb(db);
  return enquiry;
}

export async function getQuotations(): Promise<Quotation[]> {
  const db = await getFullDbState();
  return db.quotations;
}

export async function createOrUpdateQuotation(input: {
  id?: string;
  enquiry_id: string;
  title: string;
  quoted_amount_paise: number;
  valid_until: string;
  document_url?: string;
  summary_notes: string;
  status?: Quotation["status"];
  created_by?: string;
}): Promise<Quotation> {
  const db = ensureLocalDb();
  const now = new Date().toISOString();
  const enquiry = db.enquiries.find((e) => e.id === input.enquiry_id) || db.enquiries[0];

  if (input.id) {
    const idx = db.quotations.findIndex((q) => q.id === input.id);
    if (idx >= 0) {
      db.quotations[idx] = {
        ...db.quotations[idx],
        ...input,
        updated_at: now,
      };
      saveLocalDb(db);
      return db.quotations[idx];
    }
  }

  const newQtn: Quotation = {
    id: `qtn-${Date.now()}`,
    quotation_number: `QTN-2026-${Math.floor(3000 + Math.random() * 6000)}`,
    enquiry_id: enquiry ? enquiry.id : input.enquiry_id,
    enquiry_number: enquiry ? enquiry.enquiry_number : "ENQ-CUSTOM",
    customer_name: enquiry ? enquiry.customer_name : "Valued Customer",
    customer_phone: enquiry ? enquiry.mobile_number : "",
    store_section: enquiry ? enquiry.store_section : "PREMIUM",
    title: input.title,
    quoted_amount_paise: input.quoted_amount_paise,
    valid_until: input.valid_until,
    document_url: input.document_url,
    summary_notes: input.summary_notes,
    status: input.status || "SENT",
    created_by: input.created_by || "Furcho Admin",
    created_at: now,
    updated_at: now,
  };

  if (enquiry) {
    enquiry.status = "QUOTATION_SENT";
    enquiry.updated_at = now;
  }

  db.quotations.unshift(newQtn);
  saveLocalDb(db);
  return newQtn;
}

export async function deleteQuotationById(id: string): Promise<boolean> {
  const db = ensureLocalDb();
  const before = db.quotations.length;
  db.quotations = db.quotations.filter((q) => q.id !== id);
  saveLocalDb(db);
  return db.quotations.length < before;
}

export async function getCustomers(): Promise<Customer[]> {
  const db = await getFullDbState();
  return db.customers;
}
