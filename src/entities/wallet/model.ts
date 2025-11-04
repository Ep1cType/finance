export namespace Wallet {
  export interface Entity {
    id: string | number;
    name: string;
    amount: number;
    history: History[];
  }

  export interface History {
    date: string;
    value: number;
  }
}
