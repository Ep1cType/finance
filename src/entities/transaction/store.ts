import { createEffect, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { Transaction } from "./model";

export const TransactionGate = createGate();

TransactionGate.open.watch(() => {});

export const $transactionList = createStore<Transaction.Item[]>([]);
export const $groupedTransactionList = createStore<Transaction.GroupedByDate[]>([]);

export const fetchTransactionListFx = createEffect(async () => {
  try {
    const response = await fetch("/api", {
      method: "GET",
    });
    return (await response.json()) as Transaction.Item[];
  } catch (e) {
    console.error(e);
    return [];
  }
});

export const addTransactionFx = createEffect(async (transaction: Transaction.Payload) => {
  try {
    const response = await fetch("/api", {
      method: "POST",
      body: JSON.stringify(transaction),
    });

    const data = await response.json();

    return data as Transaction.Item;
  } catch (e) {
    console.error(e);
  }
});

export const removeTransactionFx = createEffect(async (id: Transaction.Item["id"]) => {
  try {
    const response = await fetch("/api", {
      method: "DELETE",
      body: JSON.stringify(id),
    });

    const data = await response.json();

    return data as Transaction.Item;
  } catch (e) {
    console.error(e);
  }
});

sample({
  clock: TransactionGate.open,
  target: fetchTransactionListFx,
});

$transactionList
  .on(fetchTransactionListFx.doneData, (_, transactions) => transactions)
  .on(addTransactionFx.doneData, (state, transaction) => {
    if (transaction) {
      return [...state, transaction];
    }
    return state;
  });

$groupedTransactionList
  .on(fetchTransactionListFx.doneData, (_, transactions) => Transaction.groupByDate(transactions))
  .on(addTransactionFx.doneData, (state, transaction) => {
    if (transaction) {
      return Transaction.addItemToGrouped(state, transaction);
    }
    return state;
  })
  .on(removeTransactionFx.doneData, (state, transaction) => {
    if (transaction) {
      return Transaction.removeTransactionFromGroup(state, transaction.id);
    }
    return state;
  });
