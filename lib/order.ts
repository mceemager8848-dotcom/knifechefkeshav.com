import { deliveryLabel, type DeliveryZone, orderTotal, PRODUCT } from "@/lib/product";

export const ORDER_STATUSES = [
  "New Order",
  "Order Confirmed",
  "Order Ongoing",
  "Delivered",
  "Cancelled",
] as const;

export type Order = {
  requestId: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  productName: string;
  quantity: number;
  pricePerPiece: number;
  subtotal: number;
  deliveryZone: DeliveryZone;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  notes: string;
};

type ValidationResult =
  | { ok: true; order: Order }
  | { ok: false; issues: Record<string, string> };

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function makeOrderId(requestId: string) {
  const compact = requestId.replaceAll("-", "").toUpperCase();
  return `ZW-${compact.slice(0, 8)}-${compact.slice(8, 16)}`;
}

function kathmanduTimestamp() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function validateOrderPayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, issues: { form: "Invalid order data." } };
  }

  const data = payload as Record<string, unknown>;
  const issues: Record<string, string> = {};
  const requestId = cleanString(data.requestId);
  const customerName = cleanString(data.customerName);
  const phone = cleanString(data.phone);
  const email = cleanString(data.email).toLowerCase();
  const location = cleanString(data.location);
  const productName = cleanString(data.productName);
  const quantity = numberValue(data.quantity);
  const pricePerPiece = numberValue(data.pricePerPiece);
  const deliveryFee = numberValue(data.deliveryFee);
  const totalPrice = numberValue(data.totalPrice);
  const deliveryZone = cleanString(data.deliveryZone) as DeliveryZone;

  if (!isUuid(requestId)) issues.requestId = "Please refresh the page and try again.";
  if (customerName.length < 2 || customerName.length > 100) issues.customerName = "Please enter your full name.";
  if (!/^\+?[0-9][0-9\s-]{6,18}$/.test(phone)) issues.phone = "Please enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) issues.email = "Please enter a valid email address.";
  if (location.length < 5 || location.length > 500) issues.location = "Kindly share your exact location.";
  if (productName !== PRODUCT.name) issues.productName = "The selected product is invalid.";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) issues.quantity = "Quantity must be between 1 and 10.";
  if (!(deliveryZone in PRODUCT.deliveryFees)) issues.deliveryZone = "Please select a valid delivery area.";

  if (!issues.deliveryZone && Number.isInteger(quantity) && quantity >= 1 && quantity <= 10) {
    const expectedFee = PRODUCT.deliveryFees[deliveryZone];
    const expectedTotal = orderTotal(quantity, deliveryZone);
    if (pricePerPiece !== PRODUCT.offerPrice) issues.pricePerPiece = "The product price has changed. Please refresh and try again.";
    if (deliveryFee !== expectedFee) issues.deliveryFee = "The delivery fee is invalid.";
    if (totalPrice !== expectedTotal) issues.totalPrice = "The order total is invalid. Please refresh and try again.";
  }

  if (Object.keys(issues).length > 0) return { ok: false, issues };

  const subtotal = PRODUCT.offerPrice * quantity;
  return {
    ok: true,
    order: {
      requestId,
      orderId: makeOrderId(requestId),
      createdAt: kathmanduTimestamp(),
      customerName,
      phone,
      email,
      location,
      productName: PRODUCT.name,
      quantity,
      pricePerPiece: PRODUCT.offerPrice,
      subtotal,
      deliveryZone,
      deliveryFee: PRODUCT.deliveryFees[deliveryZone],
      totalPrice: subtotal + PRODUCT.deliveryFees[deliveryZone],
      paymentMethod: "Cash On Delivery",
      orderStatus: "New Order",
      notes: "",
    },
  };
}

export function orderForLog(order: Order) {
  return {
    ...order,
    deliveryArea: deliveryLabel(order.deliveryZone),
  };
}
