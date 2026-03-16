export namespace Transaction {
  export type Type = "income" | "expense" | "transfer";
  export type RecurrenceType = "daily" | "weekly" | "monthly" | "quarterly";

  export interface Recurrence {
    type: RecurrenceType;
    nextDate: string;
  }

  type RecurringPeriod = "daily" | "weekly" | "monthly" | "yearly";

  export interface Tag {
    id: string | number;
    name: string;
  }

  export interface Item {
    categoryId: "699ced88-9772-4da6-9d2d-1452c2e8ec12";
    imageUrl: null;
    transferToWalletId: null;
    transferFromWalletId: null;
    isRecurring: false;
    recurringPeriod: null;
    recurringDay: null;
    recurringEndDate: null;
    lastExecuted: null;
    nextExecution: null;
    subitems: [
      {
        id: "b7488732-413a-4f21-823d-3a3827d65d07";
        name: "Хлеб";
        amount: "500";
        transactionId: "518a9601-015c-4a56-a587-1113071a96cc";
        createdAt: "2026-01-08T20:51:40.637Z";
        updatedAt: "2026-01-08T20:51:40.637Z";
      },
      {
        id: "5809d995-a67e-4f70-adbc-921222b69207";
        name: "Пирожок";
        amount: "100";
        transactionId: "518a9601-015c-4a56-a587-1113071a96cc";
        createdAt: "2026-01-08T20:51:40.637Z";
        updatedAt: "2026-01-08T20:51:40.637Z";
      },
    ];
    tags: [];
    category: {
      id: "699ced88-9772-4da6-9d2d-1452c2e8ec12";
      name: "Bills";
      icon: "💡";
      color: "#FFAAA5";
      isDefault: true;
      userId: null;
      createdAt: "2026-01-08T20:46:46.655Z";
      updatedAt: "2026-01-08T20:46:46.655Z";
    };

    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    amount: string;
    type: string;
    // category: string;
    description: string | null;
    date: string;
    walletId: string;

    // id: number | string;
    // type: Type;
    // amount: number;
    // date: string;
    // note: string;
    // category: string;
    // tags: Tag[];
    // recurrence: null | Recurrence;
    // subItems: SubItem[];
  }

  export interface Payload {
    amount?: string;
    type: Type;
    categoryId: string;
    description?: string;
    date?: string;
    walletId: string;
    subitems?: SubItemPayload[];
    tagIds?: string[];
    imageUrl?: string;

    // tags: Tag["id"][];
    // recurrence: null | Recurrence;
    // subItems: SubItem[];
  }

  export interface TransferPayload extends Payload {
    transferToWalletId?: string;
  }

  export interface RecurringPayload extends TransferPayload {
    isRecurring?: boolean;
    recurringPeriod?: RecurringPeriod;
    recurringDay?: number;
    recurringEndDate?: Date;
  }

  export interface SubItemPayload {
    name: string;
    amount: string;
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
