import Link from "next/link";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { SiteHeader } from "@/components/site-header";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-bone">
      <SiteHeader compact />
      <div className="shell py-6 sm:py-10">
        <div className="mb-7 flex items-center gap-2 text-sm text-black/45">
          <Link href="/" className="font-bold hover:text-zwilling">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Checkout</span>
        </div>
        <Suspense fallback={<div className="min-h-[600px] animate-pulse rounded-[2rem] bg-white" />}>
          <CheckoutForm />
        </Suspense>
      </div>
      <footer className="py-8 text-center text-xs text-black/45">
        Secure Cash on Delivery checkout · Need help? <a href="tel:+9779842839204" className="font-bold text-ink">9842839204</a>
      </footer>
    </main>
  );
}
