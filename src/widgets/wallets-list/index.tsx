"use client";

import { useUnit } from "effector-react";
import { $wallets, toggleDefaultWalletFx } from "entity/wallet/store";
import { AddWallet } from "features/add-wallet";
import { Wallet } from "lucide-react";
import { WalletCard } from "widgets/wallet-card";

export const WalletsList = () => {
  const [wallets, toggleDefault] = useUnit([$wallets, toggleDefaultWalletFx]);

  if (wallets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">У вас пока нет счетов</h3>
        <p className="text-gray-600 mb-6">Создайте свой первый счёт для управления финансами</p>
        <AddWallet />
      </div>
    );
  }

  return (
    <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
      {wallets.map((wallet) => (
        <li key={wallet.id}>
          <WalletCard wallet={wallet} toggleDefault={toggleDefault} />
        </li>
      ))}
    </ul>
  );
};
