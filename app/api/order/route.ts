import { NextRequest, NextResponse } from "next/server";
import { sendBusinessOrderEmail, sendCustomerOrderEmail } from "@/lib/email";
import { appendOrder, findOrder, updateEmailStatus } from "@/lib/google-sheets";
import { orderForLog, validateOrderPayload } from "@/lib/order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function originAllowed(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "same-origin") return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    if (host && new URL(origin).host === host) return true;
  } catch {
    return false;
  }
  const allowed = new Set(
    [request.nextUrl.origin, process.env.FRONTEND_URL, process.env.NEXT_PUBLIC_SITE_URL]
      .filter(Boolean)
      .map((value) => String(value).replace(/\/$/, "")),
  );
  return allowed.has(origin.replace(/\/$/, ""));
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) {
    return NextResponse.json({ success: false, message: "This order request is not allowed." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 25_000) {
    return NextResponse.json({ success: false, message: "The order request is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid order data." }, { status: 400 });
  }

  const validation = validateOrderPayload(body);
  if (!validation.ok) {
    return NextResponse.json(
      { success: false, message: "Please correct the highlighted order details.", issues: validation.issues },
      { status: 400 },
    );
  }

  const { order } = validation;

  if (process.env.ORDER_SUBMISSION_MODE === "mock") {
    console.info("Mock order accepted", orderForLog(order));
    return NextResponse.json({ success: true, orderId: order.orderId, mode: "mock" });
  }

  try {
    let existing = await findOrder(order.orderId);
    if (!existing) existing = await appendOrder(order);

    if (existing.businessEmailStatus !== "Sent") {
      try {
        await sendBusinessOrderEmail(order);
        await updateEmailStatus(existing.rowNumber, "business", "Sent");
        existing.businessEmailStatus = "Sent";
      } catch (error) {
        console.error(`Business email failed for ${order.orderId}`, error);
        await updateEmailStatus(existing.rowNumber, "business", "Failed").catch(() => undefined);
        throw new Error("Your order was saved, but the business notification could not be sent. Please try again.");
      }
    }

    if (existing.customerEmailStatus !== "Sent") {
      try {
        await sendCustomerOrderEmail(order);
        await updateEmailStatus(existing.rowNumber, "customer", "Sent");
        existing.customerEmailStatus = "Sent";
      } catch (error) {
        console.error(`Customer email failed for ${order.orderId}`, error);
        await updateEmailStatus(existing.rowNumber, "customer", "Failed").catch(() => undefined);
        throw new Error("Your order was saved, but the confirmation email could not be sent. Please try again.");
      }
    }

    return NextResponse.json({ success: true, orderId: order.orderId });
  } catch (error) {
    console.error(`Order submission failed for ${order.orderId}`, error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "We could not submit your order. Please try again or call 9842839204.",
      },
      { status: 500 },
    );
  }
}
