export namespace Wallet {
  export interface Entity {
    id: string;
    balance: string;
    createdAt: string;
    currency: "USD";
    isDefault: boolean;
    name: string;
    updatedAt: string;
    userId: string;
  }

  export interface History {
    date: string;
    value: number;
  }

  export type Payload = {
    name: string;
    balance?: string;
    currency?: string;
  };
}
