"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  deliveryLabel,
  type DeliveryZone,
  formatNpr,
  orderTotal,
  PRODUCT,
} from "@/lib/product";

function initialQuantity(raw: string | null) {
  const quantity = Number.parseInt(raw || "1", 10);
  return Number.isFinite(quantity) ? Math.min(10, Math.max(1, quantity)) : 1;
}

function initialZone(raw: string | null): DeliveryZone {
  return raw === "outside" ? "outside" : "inside";
}

export function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(() => initialQuantity(searchParams.get("quantity")));
  const [zone, setZone] = useState<DeliveryZone>(() => initialZone(searchParams.get("zone")));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef<string>("");
  const total = useMemo(() => orderTotal(quantity, zone), [quantity, zone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    if (!requestIdRef.current) {
      requestIdRef.current =
        sessionStorage.getItem("chefkeshav_pending_order_id") || crypto.randomUUID();
      sessionStorage.setItem("chefkeshav_pending_order_id", requestIdRef.current);
    }

    const form = new FormData(event.currentTarget);
    const payload = {
      requestId: requestIdRef.current,
      customerName: String(form.get("customerName") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim(),
      location: String(form.get("location") || "").trim(),
      productName: PRODUCT.name,
      quantity,
      pricePerPiece: PRODUCT.offerPrice,
      deliveryZone: zone,
      deliveryFee: PRODUCT.deliveryFees[zone],
      totalPrice: total,
    };

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        orderId?: string;
        message?: string;
        issues?: Record<string, string>;
      };

      if (!response.ok || !result.success || !result.orderId) {
        const issue = result.issues ? Object.values(result.issues)[0] : undefined;
        throw new Error(issue || result.message || "We could not submit your order. Please try again.");
      }

      sessionStorage.removeItem("chefkeshav_pending_order_id");
      const params = new URLSearchParams({
        orderId: result.orderId,
        product: PRODUCT.shortName,
        quantity: String(quantity),
        total: String(total),
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit your order. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
      <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-soft sm:p-9" aria-labelledby="delivery-details">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-zwilling">Step 1 of 1</p>
            <h1 id="delivery-details" className="display mt-3 text-4xl font-bold">Delivery details</h1>
          </div>
          <div className="hidden h-12 w-12 place-items-center rounded-full bg-green-50 text-xl sm:grid" aria-hidden="true">✓</div>
        </div>
        <p className="mt-4 text-sm leading-6 text-black/55">
          Enter the person and location we should use for order confirmation and delivery.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            Full name
            <input
              name="customerName"
              autoComplete="name"
              required
              minLength={2}
              placeholder="Your full name"
              className="focus-ring h-13 rounded-xl border border-black/15 bg-paper px-4 py-3 font-normal outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Phone number
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              minLength={7}
              placeholder="98XXXXXXXX"
              className="focus-ring h-13 rounded-xl border border-black/15 bg-paper px-4 py-3 font-normal outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="focus-ring h-13 rounded-xl border border-black/15 bg-paper px-4 py-3 font-normal outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            Exact location
            <textarea
              name="location"
              autoComplete="street-address"
              required
              minLength={5}
              rows={4}
              placeholder="Kindly share your exact location"
              className="focus-ring resize-none rounded-xl border border-black/15 bg-paper px-4 py-3 font-normal outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold sm:col-span-2">
            Delivery area
            <select
              value={zone}
              onChange={(event) => setZone(event.target.value as DeliveryZone)}
              className="focus-ring h-13 rounded-xl border border-black/15 bg-paper px-4 py-3 font-normal outline-none"
            >
              <option value="inside">Inside Kathmandu Valley — Rs 100</option>
              <option value="outside">Outside Kathmandu Valley — Rs 150</option>
            </select>
          </label>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-800">
            {error}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />Submitting Order...</>
          ) : (
            <>Order now — {formatNpr(total)} <span aria-hidden="true">→</span></>
          )}
        </button>
        <p className="mt-4 text-center text-xs leading-5 text-black/45">
          By ordering, you confirm that our sales representative may call you to verify delivery details.
        </p>
      </section>

      <aside className="rounded-[2rem] bg-ink p-6 text-white shadow-soft sm:p-8 lg:sticky lg:top-6" aria-label="Order summary">
        <p className="eyebrow text-red-400">Your order</p>
        <div className="mt-6 flex gap-4 border-b border-white/15 pb-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white">
            <Image src="/images/zwilling-set.png" alt="ZWILLING knife set" fill sizes="96px" className="object-contain p-3" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold leading-snug">{PRODUCT.shortName}</h2>
            <p className="mt-2 text-sm text-white/50">Chef&apos;s knife + Paring knife</p>
            <p className="mt-2 text-sm font-bold text-red-300">{formatNpr(PRODUCT.offerPrice)} each</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-bold">Quantity</span>
          <div className="inline-flex items-center rounded-full border border-white/20 p-1">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity === 1}
              aria-label="Decrease quantity"
              className="focus-ring grid h-9 w-9 place-items-center rounded-full disabled:opacity-30"
            >−</button>
            <span className="w-9 text-center font-black" aria-live="polite">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(10, value + 1))}
              disabled={quantity === 10}
              aria-label="Increase quantity"
              className="focus-ring grid h-9 w-9 place-items-center rounded-full disabled:opacity-30"
            >+</button>
          </div>
        </div>

        <dl className="mt-7 grid gap-4 border-y border-white/15 py-6 text-sm">
          <div className="flex justify-between gap-4 text-white/60">
            <dt>Product subtotal</dt>
            <dd>{formatNpr(PRODUCT.offerPrice * quantity)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-white/60">
            <dt>{deliveryLabel(zone)}</dt>
            <dd>{formatNpr(PRODUCT.deliveryFees[zone])}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-extrabold">Total</dt>
            <dd className="text-xl font-black">{formatNpr(total)}</dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-3 text-sm text-white/60">
          <p className="flex gap-3"><span className="text-green-400">✓</span> Payment: Cash on Delivery</p>
          <p className="flex gap-3"><span className="text-green-400">✓</span> Delivery: 2–5 business days</p>
          <p className="flex gap-3"><span className="text-green-400">✓</span> Phone confirmation before dispatch</p>
        </div>
      </aside>
    </form>
  );
}
