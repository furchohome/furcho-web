import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { addProductReview } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, author_name, district, rating, comment } = body;

    if (!product_id || !author_name || !comment) {
      return NextResponse.json(
        { error: "Please provide your name, star rating, and review comment." },
        { status: 400 }
      );
    }

    const review = await addProductReview(product_id, {
      author_name,
      district: district || undefined,
      rating: Number(rating) || 5,
      comment,
    });

    // Revalidate edge cache so the new review is immediately live
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      review,
      message: "Review submitted successfully.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit review.";
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
