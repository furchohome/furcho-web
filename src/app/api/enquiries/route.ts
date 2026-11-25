import { NextRequest, NextResponse } from "next/server";
import { createCustomEnquiry, getEnquiries, updateEnquiryByAdmin } from "@/lib/db";
import { customEnquirySchema } from "@/lib/validations";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }
  const enquiries = await getEnquiries();
  return NextResponse.json({ enquiries });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = customEnquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.errors[0]?.message || "Please check the enquiry form fields.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const enquiry = await createCustomEnquiry({
      ...parsed.data,
      attachment_urls: Array.isArray(body.attachment_urls) ? body.attachment_urls : [],
    });

    return NextResponse.json({
      enquiry,
      message: "Your custom furniture enquiry has been received by the Furcho team.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit enquiry.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const body = await req.json();
    if (!body.enquiryId) {
      return NextResponse.json({ error: "Enquiry ID is required." }, { status: 400 });
    }

    const updated = await updateEnquiryByAdmin(body.enquiryId, {
      status: body.status,
      assigned_staff: body.assigned_staff,
      internal_notes: body.internal_notes,
      follow_up_note: body.follow_up_note,
    });

    return NextResponse.json({ enquiry: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update enquiry.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
