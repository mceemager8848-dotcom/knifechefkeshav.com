"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  checkoutHref,
  deliveryLabel,
  type DeliveryZone,
  formatNpr,
  orderTotal,
  PRODUCT,
} from "@/lib/product";

export function ProductExperience() {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zone, setZone] = useState<DeliveryZone>("inside");

  const total = useMemo(() => orderTotal(quantity, zone), [quantity, zone]);
  const checkout = checkoutHref(quantity, zone);

  const changeQuantity = (next: number) => {
    setQuantity(Math.max(1, Math.min(10, next)));
  };

  const stepImage = (direction: -1 | 1) => {
    setActiveImage((current) =>
      (current + direction + PRODUCT.images.length) % PRODUCT.images.length,
    );
  };

  return (
    <section id="details" className="bg-bone py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[1.06fr_.94fr] lg:items-center">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white shadow-soft">
            <Image
              key={PRODUCT.images[activeImage].src}
              src={PRODUCT.images[activeImage].src}
              alt={PRODUCT.images[activeImage].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-contain p-10 sm:p-16"
            />
            <div className="absolute inset-x-5 top-5 flex justify-between">
              <span className="rounded-full bg-ink px-3 py-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-white">
                2-piece essential set
              </span>
              <span className="rounded-full bg-white/90 px-3 py-2 text-xs font-bold shadow-sm backdrop-blur">
                {activeImage + 1} / {PRODUCT.images.length}
              </span>
            </div>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={() => stepImage(-1)}
              className="focus-ring absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={() => stepImage(1)}
              className="focus-ring absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg"
            >
              →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3" aria-label="Product gallery">
            {PRODUCT.images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === activeImage}
                className={`focus-ring relative aspect-square overflow-hidden rounded-2xl bg-white transition ${
                  index === activeImage
                    ? "ring-2 ring-zwilling ring-offset-2 ring-offset-bone"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={image.src} alt="" fill sizes="120px" className="object-contain p-3" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:pl-6">
          <p className="eyebrow text-zwilling">The everyday knife duo</p>
          <h2 className="display mt-4 text-4xl font-bold leading-[1.02] sm:text-6xl">
            Two blades. Every prep task covered.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-black/65">
            The 8-inch chef&apos;s knife handles confident chopping, slicing, and dicing. The agile
            4-inch paring knife takes care of peeling, trimming, and detail work.
          </p>

          <ul className="mt-7 grid gap-3 text-sm font-bold sm:grid-cols-2">
            {[
              "High-carbon NO STAIN steel",
              "FRIODUR® ice-hardened blades",
              "Lightweight, balanced handling",
              "Secure three-rivet grip",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 text-zwilling" aria-hidden="true">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-y border-black/10 py-6">
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="text-3xl font-black">{formatNpr(PRODUCT.offerPrice)}</span>
              <span className="pb-1 text-lg text-black/40 line-through">{formatNpr(PRODUCT.regularPrice)}</span>
              <span className="mb-1 rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-zwilling">
                Save {formatNpr(PRODUCT.regularPrice - PRODUCT.offerPrice)}
              </span>
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <span className="text-sm font-extrabold">Quantity</span>
              <div className="mt-3 inline-flex items-center rounded-full border border-black/15 bg-white p-1">
                <button
                  type="button"
                  onClick={() => changeQuantity(quantity - 1)}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full text-xl disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-10 text-center font-black" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => changeQuantity(quantity + 1)}
                  disabled={quantity === 10}
                  aria-label="Increase quantity"
                  className="focus-ring grid h-10 w-10 place-items-center rounded-full text-xl disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
            <fieldset>
              <legend className="text-sm font-extrabold">Delivery area</legend>
              <div className="mt-3 grid gap-2 text-sm">
                {(["inside", "outside"] as DeliveryZone[]).map((value) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="delivery-zone"
                      value={value}
                      checked={zone === value}
                      onChange={() => setZone(value)}
                      className="accent-zwilling"
                    />
                    <span>{value === "inside" ? "Inside Valley" : "Outside Valley"}</span>
                    <span className="ml-auto font-bold">{formatNpr(PRODUCT.deliveryFees[value])}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-7 rounded-2xl bg-white p-5 shadow-sm" aria-live="polite">
            <div className="flex justify-between text-sm text-black/60">
              <span>{quantity} × {formatNpr(PRODUCT.offerPrice)}</span>
              <span>{formatNpr(PRODUCT.offerPrice * quantity)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-black/60">
              <span>{deliveryLabel(zone)}</span>
              <span>{formatNpr(PRODUCT.deliveryFees[zone])}</span>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-black/10 pt-4">
              <span className="font-extrabold">Total</span>
              <span className="text-2xl font-black">{formatNpr(total)}</span>
            </div>
          </div>

          <Link href={checkout} className="btn-primary mt-6 w-full text-base">
            Buy now — {formatNpr(total)}
            <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-4 text-center text-xs font-bold text-black/50">
            Cash on Delivery · 2–5 business days · Support: 9842839204
          </p>
        </div>
      </div>
    </section>
  );
}
