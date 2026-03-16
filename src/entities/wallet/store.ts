import { createEffect, createStore, sample } from "effector";
import { createGate } from "effector-react";
import type { Wallet } from "entity/wallet/model";
import { setWallet } from "features/add-transaction/store";
import { fetchWrapper } from "shared/api/fetchWrapper";
//
//
//
//
//

//
//
//
//

export const WalletsGate = createGate();

export const $wallets = createStore<Wallet.Entity[]>([]);
export const $defaultWallet = $wallets.map((wallets) => {
  const defaultWallet = wallets.find((wallet) => wallet.isDefault);
  if (!defaultWallet) return null;
  return defaultWallet;
});

export const fetchWalletsFx = createEffect(async () => {
  try {
    const response = await fetchWrapper.get<Wallet.Entity[]>("/wallets");

    if (response.error || !response.data) {
      return [];
      // throw new Error("");
    }

    return response.data;
  } catch (e) {
    console.error(e);
    return [];
  }
});

export const addWalletFx = createEffect(async (wallet: Wallet.Payload) => {
  try {
    const response = await fetchWrapper.post<Wallet.Entity>("/wallets", wallet);

    if (response.error || !response.data) {
      return;
    }

    return response.data;
  } catch (e) {
    console.error(e);
  }
});

export const toggleDefaultWalletFx = createEffect(async (id: Wallet.Entity["id"]) => {
  try {
    const response = await fetchWrapper.patch<Wallet.Entity>(`/wallets/${id}`, {
      isDefault: true,
    });

    if (response.error || !response.data) return;
    return response.data;
  } catch (e) {
    console.error(e);
  }
});

sample({
  clock: WalletsGate.open,
  target: fetchWalletsFx,
});

$wallets
  .on(fetchWalletsFx.doneData, (_, wallets) => wallets)
  .on(toggleDefaultWalletFx.doneData, (state, payload) => {
    if (payload) {
      return state.map((wallet) =>
        wallet.id === payload.id ? { ...wallet, isDefault: payload.isDefault } : { ...wallet, isDefault: false },
      );
    } else {
      return state;
    }
  });

sample({
  clock: $wallets,
  fn: (wallets) => {
    const defaultWallet = wallets.find((w) => w.isDefault);
    if (!defaultWallet) return "";
    return defaultWallet.id;
  },
  target: setWallet,
});
