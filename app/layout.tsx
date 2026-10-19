import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZWILLING Knife Set Nepal | ChefKeshav",
  description:
    "A premium ZWILLING chef's knife and paring knife set with Cash on Delivery across Nepal.",
  icons: { icon: "/images/zwilling-logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#151515",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
