import { AddWallet } from "features/add-wallet";
import { PageLayout } from "shared/ui/page-layout";
import { TotalWalletBalance } from "widgets/total-wallet-balance";
import { WalletsList } from "widgets/wallets-list";

export default function WalletsPage() {
  return (
    <PageLayout title="Счета" action={<AddWallet />}>
      <h1 className="text-2xl font-semibold mb-2">Ваши кошельки:</h1>
      <TotalWalletBalance />
      <WalletsList />
    </PageLayout>
  );
}
