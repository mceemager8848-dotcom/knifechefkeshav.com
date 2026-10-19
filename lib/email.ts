import "server-only";
import nodemailer from "nodemailer";
import { deliveryLabel, formatNpr } from "@/lib/product";
import type { Order } from "@/lib/order";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Server configuration is missing ${name}.`);
  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell(content: string, preheader: string, brand: string) {
  return `<!doctype html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;background:#f4f0e8;font-family:Arial,Helvetica,sans-serif;color:#151515;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f0e8;padding:24px 12px;">
        <tr><td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.08);">
            <tr><td style="background:#151515;padding:28px 32px;color:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
                <td style="font-size:22px;font-weight:800;">${escapeHtml(brand)}</td>
                <td align="right" style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#ff9fa5;">ZWILLING selection</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:34px 32px;">${content}</td></tr>
            <tr><td style="padding:22px 32px;background:#fbfaf7;border-top:1px solid #ece8df;text-align:center;font-size:12px;line-height:19px;color:#777;">
              ${escapeHtml(brand)} · Premium tools for everyday cooks
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>`;
}

function detailRow(label: string, value: string, last = false) {
  return `<tr>
    <td style="padding:11px 0;${last ? "" : "border-bottom:1px solid #eee;"}font-size:13px;color:#777;vertical-align:top;">${escapeHtml(label)}</td>
    <td align="right" style="padding:11px 0;${last ? "" : "border-bottom:1px solid #eee;"}font-size:13px;font-weight:700;color:#151515;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

function transporter() {
  const port = Number(requiredEnv("SMTP_PORT"));
  if (!Number.isInteger(port) || port < 1) throw new Error("SMTP_PORT must be a valid port number.");
  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASS"),
    },
  });
}

function sender() {
  const brand = requiredEnv("BRAND_NAME");
  const email = requiredEnv("EMAIL_FROM");
  return { brand, email, formatted: `${brand} <${email}>` };
}

export async function sendBusinessOrderEmail(order: Order) {
  const { brand, email, formatted } = sender();
  const businessEmail = requiredEnv("BUSINESS_EMAIL");
  const html = emailShell(
    `<p style="margin:0 0 8px;color:#e30613;font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">New order received</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.12;">A customer is ready to order.</h1>
    <p style="margin:14px 0 28px;color:#666;font-size:15px;line-height:24px;">Order <strong style="color:#151515;">${escapeHtml(order.orderId)}</strong> was submitted on ${escapeHtml(order.createdAt)}.</p>
    <div style="margin:0 0 24px;padding:16px 18px;border-radius:12px;background:#fff2f3;border-left:4px solid #e30613;font-size:14px;font-weight:700;line-height:22px;">Please call the customer soon to confirm this order.</div>
    <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#777;">Customer details</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:26px;">
      ${detailRow("Customer", order.customerName)}
      ${detailRow("Phone", order.phone)}
      ${detailRow("Email", order.email)}
      ${detailRow("Exact location", order.location, true)}
    </table>
    <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#777;">Product & payment</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${detailRow("Product", order.productName)}
      ${detailRow("Quantity", String(order.quantity))}
      ${detailRow("Price per piece", formatNpr(order.pricePerPiece))}
      ${detailRow("Delivery area", deliveryLabel(order.deliveryZone))}
      ${detailRow("Delivery fee", formatNpr(order.deliveryFee))}
      ${detailRow("Total", formatNpr(order.totalPrice))}
      ${detailRow("Payment", order.paymentMethod)}
      ${detailRow("Status", order.orderStatus, true)}
    </table>`,
    `New order ${order.orderId} from ${order.customerName}`,
    brand,
  );

  const result = await transporter().sendMail({
    from: formatted,
    to: businessEmail,
    replyTo: order.email,
    subject: `New Product Order Received - ${order.orderId}`,
    html,
    text: [
      `New order: ${order.orderId}`,
      `Customer: ${order.customerName}`,
      `Phone: ${order.phone}`,
      `Email: ${order.email}`,
      `Location: ${order.location}`,
      `Product: ${order.productName}`,
      `Quantity: ${order.quantity}`,
      `Total: ${formatNpr(order.totalPrice)}`,
      `Payment: ${order.paymentMethod}`,
      "Please call the customer soon to confirm this order.",
    ].join("\n"),
    headers: { "X-Order-ID": order.orderId },
  });
  if (!result.accepted.some((address) => String(address).toLowerCase() === businessEmail.toLowerCase())) {
    throw new Error("The business email server did not accept the notification recipient.");
  }
}

export async function sendCustomerOrderEmail(order: Order) {
  const { brand, email, formatted } = sender();
  const html = emailShell(
    `<p style="margin:0 0 8px;color:#e30613;font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">Order received</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.12;">Thank you, ${escapeHtml(order.customerName)}.</h1>
    <p style="margin:14px 0 28px;color:#666;font-size:15px;line-height:24px;">We have received your order successfully. Keep this email for your records.</p>
    <div style="margin:0 0 26px;padding:18px;border-radius:14px;background:#151515;color:#ffffff;">
      <p style="margin:0 0 6px;color:#ff9fa5;font-size:11px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;">Order ID</p>
      <p style="margin:0;font-size:20px;font-weight:800;">${escapeHtml(order.orderId)}</p>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${detailRow("Product", order.productName)}
      ${detailRow("Quantity", String(order.quantity))}
      ${detailRow("Delivery", deliveryLabel(order.deliveryZone))}
      ${detailRow("Total price", formatNpr(order.totalPrice))}
      ${detailRow("Payment method", order.paymentMethod, true)}
    </table>
    <div style="margin:28px 0 0;padding:18px;border-radius:12px;background:#f4f0e8;font-size:14px;line-height:23px;">
      Our sales representative will call you soon to confirm your order. Delivery usually takes 2–5 business days.
    </div>
    <p style="margin:26px 0 0;color:#666;font-size:14px;line-height:23px;">Need help? Reply to this email or call <strong style="color:#151515;">9842839204</strong>.</p>
    <p style="margin:22px 0 0;font-size:14px;line-height:22px;">Thank you,<br><strong>${escapeHtml(brand)}</strong></p>`,
    `Your ${brand} order ${order.orderId} has been received`,
    brand,
  );

  const result = await transporter().sendMail({
    from: formatted,
    to: order.email,
    replyTo: email,
    subject: `Your Order Has Been Received - ${brand}`,
    html,
    text: [
      `Hi ${order.customerName},`,
      "",
      "Thank you for your order. We have received your order successfully.",
      `Order ID: ${order.orderId}`,
      `Product: ${order.productName}`,
      `Quantity: ${order.quantity}`,
      `Total Price: ${formatNpr(order.totalPrice)}`,
      `Payment Method: ${order.paymentMethod}`,
      "",
      "Our sales representative will call you soon to confirm your order.",
      "",
      `Thank you,\n${brand}`,
    ].join("\n"),
    headers: { "X-Order-ID": order.orderId },
  });
  if (!result.accepted.some((address) => String(address).toLowerCase() === order.email.toLowerCase())) {
    throw new Error("The email server did not accept the customer confirmation recipient.");
  }
}
