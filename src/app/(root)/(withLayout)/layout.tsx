import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "shared/ui/header";
import { MobileNav } from "shared/ui/mobile-nav";

export const metadata: Metadata = {
  title: "Nnn",
};

export default function WithLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </>
  );
}
