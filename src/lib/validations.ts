import { z } from "zod";
import { KERALA_DISTRICTS } from "./utils";

export const checkoutOrderSchema = z.object({
  customer_name: z
    .string()
    .min(2, "Please enter your full name (at least 2 characters)"),
  customer_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  customer_email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  district: z.string().optional().default("All India"),
  city_town: z.string().optional().default(""),
  full_address: z
    .string()
    .min(8, "Please enter your complete delivery address (House/Flat, Street, City)"),
  pincode: z
    .string()
    .regex(/^[1-9]\d{5}$/, "Please enter a valid 6-digit Indian PIN code"),
  delivery_instructions: z.string().max(400).optional().or(z.literal("")),
});

export type CheckoutOrderFormValues = z.infer<typeof checkoutOrderSchema>;

export const customEnquirySchema = z.object({
  customer_name: z
    .string()
    .min(2, "Please enter your full name"),
  mobile_number: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  store_section: z.enum(["EVERYDAY", "PREMIUM"]),
  enquiry_category: z.string().min(2, "Please select an enquiry category"),
  product_reference: z.string().optional().or(z.literal("")),
  requirement_description: z
    .string()
    .min(10, "Please describe your requirement (at least 10 characters)"),
  preferred_dimensions: z.string().optional().or(z.literal("")),
  material_finish: z.string().optional().or(z.literal("")),
  budget_range: z.string().optional().or(z.literal("")),
  project_location: z.string().min(2, "Please enter your city / district in Kerala"),
});

export type CustomEnquiryFormValues = z.infer<typeof customEnquirySchema>;

export const adminProductSchema = z.object({
  name: z.string().min(3, "Product name is required"),
  slug: z.string().min(3, "URL slug is required"),
  sku: z.string().min(3, "SKU is required"),
  store_section: z.enum(["EVERYDAY", "PREMIUM"]),
  category_id: z.string().min(1, "Category is required"),
  subcategory_name: z.string().optional().or(z.literal("")),
  short_description: z.string().min(5, "Short description is required"),
  description: z.string().min(10, "Detailed description is required"),
  selling_price_rupees: z.coerce.number().min(0, "Selling price must be 0 or more"),
  original_price_rupees: z.coerce.number().optional().nullable(),
  launch_price_label: z.string().optional().or(z.literal("")),
  dimensions: z.string().optional().or(z.literal("")),
  material: z.string().optional().or(z.literal("")),
  delivery_info: z.string().min(3, "Delivery info is required"),
  stock_quantity: z.coerce.number().int().min(0),
  availability_status: z.enum(["IN_STOCK", "LOW_STOCK", "MADE_TO_ORDER", "OUT_OF_STOCK"]),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_demo_data: z.boolean().default(false),
  is_active: z.boolean().default(true),
  request_quote_only: z.boolean().default(false),
});
