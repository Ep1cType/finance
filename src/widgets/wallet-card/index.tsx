import type { Wallet } from "entity/wallet/model";
import { Star, WalletIcon } from "lucide-react";

type WalletCardProps = {
  wallet: Wallet.Entity;
  toggleDefault: (id: string) => void;
};

export const WalletCard = ({ wallet, toggleDefault }: WalletCardProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <WalletIcon className="w-6 h-6 text-gray-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{wallet.name}</h3>
            {wallet.isDefault && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded-full flex-shrink-0">
                <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                <span className="text-xs text-yellow-700 font-medium">По умолчанию</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatAmount(parseFloat(wallet.balance))}</p>
        </div>

        {!wallet.isDefault && (
          <button
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
            onClick={() => toggleDefault(wallet.id)}
          >
            Сделать основным
          </button>
        )}
      </div>
    </div>
  );
};
