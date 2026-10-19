"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatNpr } from "@/lib/product";

export function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "Pending confirmation";
  const product = params.get("product") || "ZWILLING 2-Piece Knife Set";
  const rawQuantity = Number(params.get("quantity"));
  const rawTotal = Number(params.get("total"));
  const quantity = Number.isInteger(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
  const total = Number.isFinite(rawTotal) && rawTotal > 0 ? rawTotal : 7099;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <section className="overflow-hidden rounded-[2rem] bg-white text-center shadow-soft">
        <div className="bg-ink px-6 py-12 text-white sm:px-12">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-400 text-4xl text-ink" aria-hidden="true">✓</div>
          <p className="eyebrow mt-7 text-red-300">Order received</p>
          <h1 className="display mt-3 text-4xl font-bold sm:text-5xl">Thank you for your order!</h1>
          <p className="mx-auto mt-5 max-w-lg leading-7 text-white/60">
            Your order has been recorded and a confirmation email is on its way.
          </p>
        </div>

        <div className="p-6 text-left sm:p-10">
          <div className="rounded-2xl bg-bone p-5 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[.15em] text-black/45">Order ID</p>
            <p className="mt-2 text-lg font-black">{orderId}</p>
          </div>

          <dl className="mt-7 divide-y divide-black/10 border-y border-black/10">
            <div className="flex justify-between gap-6 py-4">
              <dt className="text-black/50">Product ordered</dt>
              <dd className="text-right font-bold">{product}</dd>
            </div>
            <div className="flex justify-between gap-6 py-4">
              <dt className="text-black/50">Quantity</dt>
              <dd className="font-bold">{quantity}</dd>
            </div>
            <div className="flex justify-between gap-6 py-4">
              <dt className="text-black/50">Total price</dt>
              <dd className="font-black">{formatNpr(total)}</dd>
            </div>
            <div className="flex justify-between gap-6 py-4">
              <dt className="text-black/50">Payment method</dt>
              <dd className="font-bold">Cash On Delivery</dd>
            </div>
          </dl>

          <div className="mt-7 rounded-2xl border border-red-100 bg-red-50 p-5 text-center leading-7 text-red-950">
            Our sales representative will call you soon to confirm your order.
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href="/" className="btn-primary">Back to Home</Link>
            <a href="tel:+9779842839204" className="btn-secondary">Call support</a>
          </div>
          <p className="mt-5 text-center text-xs text-black/45">Expected delivery: 2–5 business days</p>
        </div>
      </section>
    </div>
  );
}
