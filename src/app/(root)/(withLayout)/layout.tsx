import { SidebarInset, SidebarProvider } from "components/ui/sidebar";
import { DesktopNav } from "features/navigation/desktop-nav";
import { MobileNav } from "features/navigation/mobile-nav";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "shared/ui/header";

export const metadata: Metadata = {
  title: "Nnn",
};

export default function WithLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SidebarProvider>
      {/*<Header />*/}
      <DesktopNav />
      <SidebarInset>{children}</SidebarInset>
      {/*<main className="min-h-screen pb-16 md:pb-0">{children}</main>*/}
      <MobileNav />
    </SidebarProvider>
  );
}
