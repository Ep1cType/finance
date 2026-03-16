"use client";

import { useUnit } from "effector-react";
import { $wallets } from "entity/wallet/store";

export const TotalWalletBalance = () => {
  const [wallets] = useUnit([$wallets]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
      <p className="text-sm text-gray-600 mb-2">Общий баланс</p>
      <p className="text-3xl font-bold text-gray-900">{formatAmount(totalBalance)}</p>
      <p className="text-sm text-gray-500 mt-1">
        {wallets.length} {wallets.length === 1 ? "счёт" : wallets.length < 5 ? "счёта" : "счётов"}
      </p>
    </div>
  );
};
