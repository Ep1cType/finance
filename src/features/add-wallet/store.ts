import type { Wallet } from "entity/wallet/model";
import { addWalletFx } from "entity/wallet/store";
import { createFormDrawer, extendFormDrawer } from "shared/lib/modal/store";

type WalletFormState = {
  name: string;
  amount: string;
};

const drawer = extendFormDrawer(
  createFormDrawer<WalletFormState, Wallet.Payload>({
    domainName: "addWalletDomain",
    drawerName: "addWalletDrawer",
    initialFormState: {
      name: "",
      amount: "",
    },
    submitEffect: async (payload) => {
      await addWalletFx(payload);
    },
    autoCloseOnSuccess: true,
    resetOnSuccess: true,
  }),
);

export const walletDrawer = {
  ...drawer,
  setName: drawer.createFieldSetter("name"),
  setAmount: drawer.createFieldSetter("amount"),
};
