import type { Transaction } from "entity/transaction/model";
import { addTransactionFx } from "entity/transaction/store";
import type { Wallet } from "entity/wallet/model";
import { createFormDrawer, extendFormDrawer } from "shared/lib/modal/store";

type TransactionFormState = {
  selectedTags: Transaction.Tag["id"][];
  wallet: Wallet.Entity["id"];
  amount: number;
  note: string;
  category: string;
  date: Date;
};

// const initialIncomeExpenseTransaction: IncomeExpenseTransaction = {
//   selectedTags: [],
//   wallet: null,
//   amount: 0,
//   note: "",
//   category: "",
//   date: new Date(),
// };

const drawer = extendFormDrawer(
  createFormDrawer<TransactionFormState, Transaction.Payload>({
    drawerName: "addTransactionDrawer",
    domainName: "addTransactionDomain",
    initialFormState: {
      amount: 0,
      wallet: "",
      category: "",
      note: "",
      date: new Date(),
      selectedTags: [],
    },
    submitEffect: async (payload) => {
      await addTransactionFx(payload);
    },
    resetOnSuccess: true,
    autoCloseOnSuccess: true,
  }),
);

export const transactionDrawer = {
  ...drawer,
  setAmount: drawer.createFieldSetter("amount"),
  setNote: drawer.createFieldSetter("note"),
  setCategory: drawer.createFieldSetter("category"),
  setDate: drawer.createFieldSetter("date"),
  setWallet: drawer.createFieldSetter("wallet"),
  toggleTag: drawer.domain.createEvent<Transaction.Tag["id"]>(),
  setIncomeExpenseData: drawer.domain.createEvent<Omit<TransactionFormState, "wallet">>(),
};

transactionDrawer.$formState.on(transactionDrawer.toggleTag, (state, tagId) => ({
  ...state,
  selectedTags: state.selectedTags.includes(tagId)
    ? state.selectedTags.filter((id) => id !== tagId)
    : [...state.selectedTags, tagId],
}));

transactionDrawer.$formState.on(transactionDrawer.setIncomeExpenseData, (state, data) => ({ ...state, ...data }));

// sample({
//   clock: $userInfo,
//   filter: (userInfo) => userInfo !== null && userInfo.wallets.length > 0,
//   fn: (userInfo) => {
//     String(userInfo!.wallets[0].id);
//   },
//   target: setWallet,
// });

// Optional: Form validation
// export const $isFormValid = $incomeExpenseFormState.map((state) => state.amount > 0 && state.category !== "");

// Optional: Error handling
// export const $formError = createStore<string | null>(null)
//   .on(submitFormFx.failData, (_, error) => error.message)
//   .reset(submitForm)
//   .reset(submitFormFx.doneData);
