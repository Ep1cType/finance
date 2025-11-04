import type { Transaction } from "entity/transaction/model";
import type { Wallet } from "../wallet/model";

export namespace User {
  export interface Entity {
    id: number | string;
    username: string;
    email: string;
    wallets: Wallet.Entity[];
    tags: Transaction.Tag[];
  }
}
