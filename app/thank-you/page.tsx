import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { ThankYouContent } from "@/components/thank-you-content";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-bone">
      <SiteHeader compact />
      <Suspense fallback={<div className="mx-auto mt-20 h-[560px] max-w-2xl animate-pulse rounded-[2rem] bg-white" />}>
        <ThankYouContent />
      </Suspense>
    </main>
  );
}
