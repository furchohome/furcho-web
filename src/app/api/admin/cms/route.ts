import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  createOrUpdateQuotation,
  deleteBannerById,
  deleteCategoryById,
  deleteProductById,
  deleteProductReview,
  deleteQuotationById,
  getFullDbState,
  updateSiteSettings,
  upsertBanner,
  upsertCategory,
  upsertProduct,
} from "@/lib/db";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin login required." }, { status: 401 });
    }
    const db = await getFullDbState();
    return NextResponse.json(db);
  } catch (err: unknown) {
    console.error("GET /api/admin/cms error:", err);
    return NextResponse.json({ error: "Failed to retrieve CMS database." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const body = await req.json();
    const { entity, action, payload } = body;

    if (entity === "product") {
      if (action === "delete") {
        await deleteProductById(payload.id);
        revalidatePath("/", "layout");
        return NextResponse.json({ success: true, message: "Product deleted successfully." });
      }
      const product = await upsertProduct(payload);
      revalidatePath("/", "layout");
      return NextResponse.json({ product, message: "Product saved successfully." });
    }

    if (entity === "category") {
      if (action === "delete") {
        await deleteCategoryById(payload.id);
        revalidatePath("/", "layout");
        return NextResponse.json({ success: true, message: "Category deleted successfully." });
      }
      const category = await upsertCategory(payload);
      revalidatePath("/", "layout");
      return NextResponse.json({ category, message: "Category saved successfully." });
    }

    if (entity === "banner") {
      if (action === "delete") {
        await deleteBannerById(payload.id);
        revalidatePath("/", "layout");
        return NextResponse.json({ success: true, message: "Banner deleted successfully." });
      }
      const banner = await upsertBanner(payload);
      revalidatePath("/", "layout");
      return NextResponse.json({ banner, message: "Banner saved successfully." });
    }

    if (entity === "quotation") {
      if (action === "delete") {
        await deleteQuotationById(payload.id);
        return NextResponse.json({ success: true, message: "Quotation deleted successfully." });
      }
      const quotation = await createOrUpdateQuotation(payload);
      return NextResponse.json({ quotation, message: "Quotation saved and linked to enquiry." });
    }

    if (entity === "review") {
      if (action === "delete") {
        await deleteProductReview(payload.product_id, payload.review_id);
        revalidatePath("/", "layout");
        return NextResponse.json({ success: true, message: "Review deleted successfully." });
      }
    }

    if (entity === "settings") {
      const settings = await updateSiteSettings(payload);
      revalidatePath("/", "layout");
      return NextResponse.json({ settings, message: "Site settings & promotional offer updated." });
    }

    return NextResponse.json({ error: "Unknown CMS entity." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CMS operation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
