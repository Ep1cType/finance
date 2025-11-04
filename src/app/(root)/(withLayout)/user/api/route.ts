import type { User } from "entity/user/model";

const user: User.Entity = {
  id: 1,
  username: "EpicType",
  email: "DenRus38@hotmail.com",
  wallets: [
    {
      id: 1,
      name: "Кошелёк для наличных",
      amount: 125000,
      history: [
        {
          date: "2025-09-01",
          value: 100000,
        },
      ],
    },
    {
      id: 2,
      name: "Кредитная карта",
      amount: 210000,
      history: [],
    },
  ],
  tags: [
    { id: 1, name: "Необходимое" },
    { id: 2, name: "Еда" },
    { id: 3, name: "Зарплата" },
    { id: 4, name: "Кофе" },
    { id: 5, name: "Желания" },
    { id: 6, name: "Здоровье" },
  ],
};

export async function GET(request: Request) {
  return Response.json(user);
}
