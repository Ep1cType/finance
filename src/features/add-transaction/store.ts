import { createEffect, createEvent, createStore, sample } from "effector";
import type { Transaction } from "entity/transaction/model";
import { addTransactionFx } from "entity/transaction/store";
import { $userInfo } from "entity/user/store";
import type { Wallet } from "entity/wallet/model";

type IncomeExpenseTransaction = {
  selectedTags: Transaction.Tag["id"][];
  wallet: Wallet.Entity["id"] | null;
  amount: number;
  note: string;
  category: string;
  date: Date;
};

const initialIncomeExpenseTransaction: IncomeExpenseTransaction = {
  selectedTags: [],
  wallet: null,
  amount: 0,
  note: "",
  category: "",
  date: new Date(),
};

export const setAmount = createEvent<number>();
export const setNote = createEvent<string>();
export const setCategory = createEvent<string>();
export const setDate = createEvent<Date>();
export const setWallet = createEvent<string>();
export const toggleTag = createEvent<Transaction.Tag["id"]>();
export const resetForm = createEvent();
export const submitForm = createEvent<Transaction.Payload>();
export const setIncomeExpenseData = createEvent<Omit<IncomeExpenseTransaction, "wallet">>();

export const toggleDrawer = createEvent<boolean>();

export const submitFormFx = createEffect<Transaction.Payload, void>(async (transaction: Transaction.Payload) => {
  await addTransactionFx(transaction);
});

export const $isOpenAddTransactionDrawer = createStore(false).on(toggleDrawer, (_, bool) => bool);

export const $incomeExpenseFormState = createStore<IncomeExpenseTransaction>(initialIncomeExpenseTransaction);

$incomeExpenseFormState
  .on(setAmount, (state, amount) => ({ ...state, amount }))
  .on(setNote, (state, note) => ({ ...state, note }))
  .on(setCategory, (state, category) => ({ ...state, category }))
  .on(setDate, (state, date) => ({ ...state, date }))
  .on(toggleTag, (state, tagId) => ({
    ...state,
    selectedTags: state.selectedTags.includes(tagId)
      ? state.selectedTags.filter((id) => id !== tagId)
      : [...state.selectedTags, tagId],
  }))
  .on(setIncomeExpenseData, (state, data) => ({ ...state, ...data }))
  .reset(resetForm)
  .reset(submitFormFx.doneData);

export const $selectedWallet = createStore<string>("")
  .on(setWallet, (_, wallet) => wallet)
  .reset(resetForm);

sample({
  clock: $userInfo,
  filter: (userInfo) => userInfo !== null && userInfo.wallets.length > 0,
  fn: (userInfo) => String(userInfo!.wallets[0].id),
  target: setWallet,
});

export const $isSubmitting = submitFormFx.pending;

sample({
  clock: submitForm,
  target: submitFormFx,
});

// Optional: Form validation
export const $isFormValid = $incomeExpenseFormState.map((state) => state.amount > 0 && state.category !== "");

// Optional: Error handling
export const $formError = createStore<string | null>(null)
  .on(submitFormFx.failData, (_, error) => error.message)
  .reset(submitForm)
  .reset(submitFormFx.doneData);
