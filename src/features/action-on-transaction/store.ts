import { createEvent, createStore, sample } from "effector";
import type { Transaction } from "entity/transaction/model";
import { removeTransactionFx } from "entity/transaction/store";
import { setIncomeExpenseData, toggleDrawer } from "features/add-transaction/store";

type DrawerState = {
  isOpen: boolean;
  transaction: Transaction.Item | null;
};

type DrawerAction = "edit" | "share" | "delete";

export const openActionDrawer = createEvent<Transaction.Item>();
export const closeActionDrawer = createEvent();
export const executeAction = createEvent<DrawerAction>();

export const $drawerState = createStore<DrawerState>({
  isOpen: false,
  transaction: null,
})
  .on(openActionDrawer, (_, transaction) => ({
    isOpen: true,
    transaction,
  }))
  .on(closeActionDrawer, () => ({
    isOpen: false,
    transaction: null,
  }));

sample({
  clock: executeAction,
  source: $drawerState,
  fn: (state, action) => ({ action, transaction: state.transaction }),
}).watch(async ({ action, transaction }) => {
  if (!transaction) return;

  if (action === "delete") {
    await removeTransactionFx(transaction.id);
    closeActionDrawer();
  }

  if (action === "edit") {
    setIncomeExpenseData({
      date: new Date(transaction.date),
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
      selectedTags: transaction.tags.map((tag) => tag.id),
    });

    toggleDrawer(true);
    closeActionDrawer();
  }
});
