export namespace Transaction {
  export type Type = "income" | "expense" | "transfer";
  export type RecurrenceType = "daily" | "weekly" | "monthly" | "quarterly";

  export interface Recurrence {
    type: RecurrenceType;
    nextDate: string;
  }

  export interface Tag {
    id: string | number;
    name: string;
  }

  export interface Item {
    id: number | string;
    type: Type;
    amount: number;
    date: string;
    note: string;
    category: string;
    tags: Tag[];
    recurrence: null | Recurrence;
    subItems: SubItem[];
  }

  export interface Payload {
    type: Type;
    amount: number;
    date: string;
    note: string;
    category: string;
    tags: Tag["id"][];
    recurrence: null | Recurrence;
    subItems: SubItem[];
  }

  export interface SubItem {
    id: number | string;
    name: string;
    amount: number;
  }

  export interface GroupedByDate {
    date: string;
    transactions: Item[];
  }
  [];

  export const extractDateOnly = (dateString: string) => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // универсальный ключ для группировки

    // return new Date(dateString).toLocaleString().split('T')[0]; // Gets YYYY-MM-DD part
  };

  export const groupByDate = (transactions: Item[]) => {
    const grouped = transactions.reduce<Record<string, Item[]>>((acc, transaction) => {
      const dateOnly = extractDateOnly(transaction.date);
      if (!acc[dateOnly]) {
        acc[dateOnly] = [];
      }
      acc[dateOnly].push(transaction);
      return acc;
    }, {});

    return Object.keys(grouped)
      .map((date) => ({
        date,
        transactions: grouped[date].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(), // Sort by full datetime desc
        ),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort groups by date desc
  };

  export const addItemToGrouped = (groups: Transaction.GroupedByDate[], newTransaction: Transaction.Item) => {
    const targetDate = extractDateOnly(newTransaction.date);

    // Find existing group or create new one
    const targetGroupIndex = groups.findIndex((group) => group.date === targetDate);

    if (targetGroupIndex === -1) {
      // Create new group and find the right position to insert it
      const newGroup: Transaction.GroupedByDate = {
        date: targetDate,
        transactions: [newTransaction],
      };

      // Find where to insert the new group (maintain date sorting - newest first)
      const insertIndex = groups.findIndex((group) => new Date(group.date) < new Date(targetDate));
      const newGroups = [...groups];

      if (insertIndex === -1) {
        newGroups.push(newGroup);
      } else {
        newGroups.splice(insertIndex, 0, newGroup);
      }

      return newGroups;
    } else {
      // Add to existing group
      const newGroups = [...groups];
      const targetGroup = { ...groups[targetGroupIndex] };

      // Insert transaction in the right position within the group (by full datetime desc)
      const insertIndex = targetGroup.transactions.findIndex((t) => new Date(t.date) < new Date(newTransaction.date));
      const newTransactions = [...targetGroup.transactions];

      if (insertIndex === -1) {
        newTransactions.push(newTransaction);
      } else {
        newTransactions.splice(insertIndex, 0, newTransaction);
      }

      targetGroup.transactions = newTransactions;
      newGroups[targetGroupIndex] = targetGroup;

      return newGroups;
    }
  };

  export const removeTransactionFromGroup = (
    groups: Transaction.GroupedByDate[],
    transactionId: Transaction.Item["id"],
  ) => {
    return groups
      .map((group) => ({
        ...group,
        transactions: group.transactions.filter((t) => t.id !== transactionId),
      }))
      .filter((group) => group.transactions.length > 0); // Remove empty groups
  };
}
