export namespace Category {
  export interface Entity {
    id: string;
    name: string;
    icon: string;
    color: string; //HEX
    isDefault: boolean;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
  }
}
