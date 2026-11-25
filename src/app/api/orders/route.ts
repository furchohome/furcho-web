import { NextRequest, NextResponse } from "next/server";
import { createOrderRequest, getOrderByNumber, getOrders, updateOrderByAdmin } from "@/lib/db";
import { checkoutOrderSchema } from "@/lib/validations";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (orderNumber) {
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  }

  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.errors[0]?.message || "Invalid checkout information.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Your shopping cart is empty." },
        { status: 400 }
      );
    }

    const order = await createOrderRequest({
      ...parsed.data,
      items: body.items,
    });

    return NextResponse.json({
      order,
      message: "Order request submitted successfully. Status: PENDING verification.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order request.";
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
    if (!body.orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const updated = await updateOrderByAdmin(body.orderId, {
      status: body.status,
      delivery_charge_paise: body.delivery_charge_paise,
      confirmed_payable_paise: body.confirmed_payable_paise,
      internal_notes: body.internal_notes,
      status_note: body.status_note,
    });

    return NextResponse.json({ order: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
