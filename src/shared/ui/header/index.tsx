"use client";

import { UserGate } from "entity/user/store";
import { AddTransaction } from "features/add-transaction";

export const Header = () => {
  return (
    <header className="h-20 border-b border-primary flex items-center">
      <UserGate />
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div>Финансы</div>
        <AddTransaction />
      </div>
    </header>
  );
};
