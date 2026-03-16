"use client";

import { CategoriesGate } from "entity/category/store";
import { UserGate } from "entity/user/store";
import { WalletsGate } from "entity/wallet/store";
import Link from "next/link";
// import { AddTransaction } from "features/add-transaction";
import type { ReactNode } from "react";

type HeaderProps = {
  title: string;
  action?: ReactNode;
};

export const Header = ({ title, action }: HeaderProps) => {
  return (
    <header className="h-14 border-b border-sidebar-border flex items-center">
      <UserGate />
      <WalletsGate />
      <CategoriesGate />
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/*<div>*/}
        {/*  <Link href="/">Домой</Link>*/}
        <div>{title}</div>
        {/*</div>*/}

        {/*<div>Финансы</div>*/}
        {/*<AddTransaction />*/}
        {action}
      </div>
    </header>
  );
};
