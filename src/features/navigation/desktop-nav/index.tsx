"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "components/ui/sidebar";
import { navItems } from "features/navigation/config";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "shared/lib/utils";

export const DesktopNav = () => {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" onClick={toggleSidebar}>
      <SidebarHeader>
        <Image src="sign_white.svg" width={40} height={40} alt="logo" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Страницы</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link onClick={(e) => e.stopPropagation()} href={item.href as any}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                    {/*<Link*/}
                    {/*  href={item.href as any}*/}
                    {/*  className={cn(*/}
                    {/*    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",*/}
                    {/*    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",*/}
                    {/*  )}*/}
                    {/*>*/}
                    {/*  <Icon className="h-5 w-5 flex-shrink-0" />*/}
                    {/*  /!*<span className="text-xs font-medium truncate w-full text-center">{item.label}</span>*!/*/}
                    {/*  <span>{item.label}</span>*/}
                    {/*</Link>*/}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button onClick={toggleSidebar}>togg</button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
