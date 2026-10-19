import Image from "next/image";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { ProductExperience } from "@/components/product-experience";
import { SiteHeader } from "@/components/site-header";
import { checkoutHref, formatNpr, PRODUCT } from "@/lib/product";

const benefits = [
  {
    number: "01",
    title: "A sharper, easier prep",
    copy: "Hand-finished edges move cleanly through meat, vegetables, herbs, and fruit—so everyday prep feels fluid rather than forced.",
  },
  {
    number: "02",
    title: "Comfort that lasts",
    copy: "Precision-stamped construction keeps each knife light in the hand, while the three-rivet handle gives you a familiar, secure grip.",
  },
  {
    number: "03",
    title: "Steel made for real kitchens",
    copy: "FRIODUR® ice-hardening helps the high-carbon NO STAIN steel retain its edge and resist corrosion through daily use.",
  },
];

const sampleTestimonials = [
  {
    quote: "The chef's knife feels balanced and confident, while the smaller knife is perfect for the detail work I do every morning.",
    name: "Aarav Shrestha",
    location: "Lalitpur",
  },
  {
    quote: "A simple two-knife set that covers nearly everything in my home kitchen. The handles feel comfortable even during longer prep.",
    name: "Sushmita Karki",
    location: "Kathmandu",
  },
  {
    quote: "Clean design, useful sizes, and much lighter in the hand than I expected. It would make a thoughtful gift for any home cook.",
    name: "Nishan Gurung",
    location: "Pokhara",
  },
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />

      <section className="grain overflow-hidden bg-ink text-white">
        <div className="shell grid min-h-[730px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.13em] text-white/80">
              <span className="h-2 w-2 rounded-full bg-zwilling" />
              German-engineered everyday essentials
            </div>
            <h1 className="display mt-7 max-w-3xl text-5xl font-bold leading-[.94] sm:text-7xl lg:text-[5.4rem]">
              The two knives your kitchen reaches for first.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/65">
              From confident chopping to delicate peeling, the ZWILLING Twin Signature duo brings
              lasting sharpness, lighter handling, and professional control to everyday prep.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={checkoutHref()} className="btn-primary px-7">
                Purchase now — {formatNpr(PRODUCT.offerPrice)}
                <span aria-hidden="true">→</span>
              </Link>
              <a href="#details" className="btn-secondary border-white/20 bg-white/10 text-white backdrop-blur">
                Explore the set
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold text-white/70">
              <span>✓ Cash on Delivery</span>
              <span>✓ 2–5 day delivery</span>
              <span>✓ Phone confirmation</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="absolute -inset-16 rounded-full bg-zwilling/20 blur-3xl" aria-hidden="true" />
            <div className="relative aspect-[.92] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
              <Image
                src="/images/zwilling-set.png"
                alt="ZWILLING 8-inch chef's knife and 4-inch paring knife set"
                fill
                loading="eager"
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-contain p-12 sm:p-20"
              />
              <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-2xl border border-black/5 bg-paper/90 p-4 text-ink shadow-lg backdrop-blur">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[.15em] text-zwilling">Limited offer</p>
                  <p className="mt-1 text-xl font-black">{formatNpr(PRODUCT.offerPrice)}</p>
                </div>
                <p className="text-right text-xs font-bold leading-5 text-black/55">Chef&apos;s knife<br />+ Paring knife</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Purchase assurances" className="border-b border-black/10 bg-paper">
        <div className="shell grid divide-y divide-black/10 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["01", "100% genuine", "German-engineered steel"],
            ["02", "Easy ordering", "Secure Cash on Delivery"],
            ["03", "Here to help", "Call 9842839204"],
          ].map(([number, title, copy]) => (
            <div key={number} className="flex items-center gap-4 px-2 py-4 sm:px-6">
              <span className="display text-3xl font-bold text-zwilling">{number}</span>
              <div>
                <p className="font-extrabold">{title}</p>
                <p className="mt-0.5 text-sm text-black/50">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductExperience />

      <section id="benefits" className="bg-ink py-20 text-white sm:py-28">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow text-red-400">Why this pair works</p>
              <h2 className="display mt-4 max-w-2xl text-4xl font-bold leading-[1.02] sm:text-6xl">
                Less effort at the board. More joy at the table.
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-white/60 lg:justify-self-end">
              You do not need a drawer full of specialty blades. One versatile chef&apos;s knife and
              one precise paring knife cover the tasks that make up most daily cooking.
            </p>
          </div>

          <div className="mt-14 grid border-y border-white/15 md:grid-cols-3 md:divide-x md:divide-white/15">
            {benefits.map((benefit) => (
              <article key={benefit.number} className="border-b border-white/15 py-9 md:border-b-0 md:px-8 first:pl-0 last:pr-0">
                <span className="display text-4xl font-bold text-red-400">{benefit.number}</span>
                <h3 className="mt-8 text-xl font-extrabold">{benefit.title}</h3>
                <p className="mt-4 leading-7 text-white/55">{benefit.copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href={checkoutHref()} className="btn-primary px-8">Order your set <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="bg-bone py-20 sm:py-28" aria-labelledby="testimonial-title">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-zwilling">Sample review copy</p>
              <h2 id="testimonial-title" className="display mt-4 text-4xl font-bold sm:text-5xl">Made for Nepal&apos;s home cooks.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-black/55">
              These are illustrative testimonials for layout preview. Replace them with verified buyer feedback before launch.
            </p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {sampleTestimonials.map((review) => (
              <figure key={review.name} className="flex min-h-72 flex-col rounded-3xl bg-white p-7 shadow-sm">
                <div className="text-sm tracking-[.2em] text-zwilling" aria-label="5 out of 5 stars">★★★★★</div>
                <blockquote className="display mt-7 flex-1 text-2xl font-bold leading-snug">“{review.quote}”</blockquote>
                <figcaption className="mt-8 border-t border-black/10 pt-5">
                  <p className="font-extrabold">{review.name}</p>
                  <p className="mt-1 text-sm text-black/45">{review.location} · Sample profile</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Faq />

      <section className="grain bg-zwilling py-20 text-white sm:py-24">
        <div className="shell text-center">
          <p className="eyebrow text-white/70">Ready when you are</p>
          <h2 className="display mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Bring sharper, lighter prep into your kitchen.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
            Order today for {formatNpr(PRODUCT.offerPrice)}. Pay only when your set arrives.
          </p>
          <Link href={checkoutHref()} className="btn-secondary mt-9 border-0 px-8">Buy now — Cash on Delivery <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <footer className="bg-ink py-12 text-white">
        <div className="shell flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/images/zwilling-logo.png" alt="ZWILLING" width={38} height={38} className="h-9 w-9 object-cover" />
              <span className="text-lg font-black">ChefKeshav</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/45">
              Premium kitchen tools selected for cooks who care about craft, comfort, and everyday performance.
            </p>
          </div>
          <div className="text-sm text-white/55 sm:text-right">
            <a href="tel:+9779842839204" className="font-bold text-white hover:text-red-300">9842839204</a>
            <p className="mt-2">Cash on Delivery across Nepal</p>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <Link href={checkoutHref()} className="btn-primary w-full shadow-2xl">Order now — {formatNpr(PRODUCT.offerPrice)}</Link>
      </div>
    </main>
  );
}
