import Image from "next/image";
import Link from "next/link";
import { checkoutHref } from "@/lib/product";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-black/10 bg-paper/95 backdrop-blur">
      <div className="shell flex h-[74px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" aria-label="ChefKeshav home">
          <Image
            src="/images/zwilling-logo.png"
            alt="ZWILLING"
            width={42}
            height={42}
            className="h-10 w-10 rounded-sm object-cover"
            priority
          />
          <span className="h-7 w-px bg-black/15" aria-hidden="true" />
          <Image
            src="/images/chefkeshav-logo.png"
            alt="ChefKeshav"
            width={164}
            height={56}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {!compact && (
          <nav className="hidden items-center gap-7 text-sm font-bold md:flex" aria-label="Main navigation">
            <a href="#details" className="hover:text-zwilling">The set</a>
            <a href="#benefits" className="hover:text-zwilling">Why it works</a>
            <a href="#faq" className="hover:text-zwilling">FAQ</a>
          </nav>
        )}

        <Link href={checkoutHref()} className="btn-primary min-h-11 px-5 text-sm">
          Order now
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}
