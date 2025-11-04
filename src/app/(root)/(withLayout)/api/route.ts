import type { Transaction } from "entity/transaction/model";

export const DEFAULT_TAGS = [
  { id: 1, name: "Необходимое" },
  { id: 2, name: "Еда" },
  { id: 3, name: "Зарплата" },
  { id: 4, name: "Кофе" },
  { id: 5, name: "Желания" },
  { id: 6, name: "Здоровье" },
];

let data: Transaction.Item[] = [
  {
    id: 1,
    type: "expense",
    category: "Покупки",
    amount: 3450.0,
    date: "2024-01-15",
    note: "Покупка продуктов в Перекрестке",
    tags: [
      { id: 1, name: "Необходимое" },
      { id: 2, name: "Еда" },
    ],
    recurrence: {
      type: "weekly",
      nextDate: "2024-01-22",
    },
    subItems: [
      { id: 1, name: "Молоко", amount: 89.9 },
      { id: 2, name: "Хлеб", amount: 45.0 },
      { id: 3, name: "Яйца", amount: 120.0 },
      { id: 4, name: "Овощи", amount: 340.0 },
      { id: 5, name: "Мясо", amount: 680.0 },
      { id: 6, name: "Фрукты", amount: 450.0 },
      { id: 7, name: "Остальное", amount: 1725.1 },
    ],
  },
  {
    id: 2,
    type: "income",
    category: "Работа",
    amount: 85000.0,
    date: "2024-01-10",
    note: "Зарплата за декабрь",
    tags: [{ id: 3, name: "Зарплата" }],
    recurrence: {
      type: "monthly",
      nextDate: "2024-02-10",
    },
    subItems: [],
  },
  {
    id: 3,
    type: "expense",
    category: "Транспорт",
    amount: 1500.0,
    date: "2024-01-14",
    note: "Заправка автомобиля",
    tags: [{ id: 1, name: "Необходимое" }],
    recurrence: null,
    subItems: [],
  },
  {
    id: 4,
    type: "transfer",
    category: "Перевод",
    amount: 10000.0,
    date: "2023-10-13",
    note: "",
    tags: [],
    recurrence: {
      type: "monthly",
      nextDate: "2024-02-13",
    },
    subItems: [],
  },
  {
    id: 5,
    type: "expense",
    category: "Еда",
    amount: 450.0,
    date: "2023-11-12",
    note: "Кофейня",
    tags: [
      { id: 4, name: "Кофе" },
      { id: 5, name: "Желания" },
    ],
    recurrence: {
      type: "daily",
      nextDate: "2024-01-13",
    },
    subItems: [
      { id: 1, name: "Капучино", amount: 250.0 },
      { id: 2, name: "Чизкейк", amount: 200.0 },
    ],
  },
  {
    id: 6,
    type: "expense",
    category: "Здоровье",
    amount: 3200.0,
    date: "2023-12-11",
    note: "Визит к стоматологу",
    tags: [
      { id: 1, name: "Необходимое" },
      { id: 6, name: "Здоровье" },
    ],
    recurrence: {
      type: "quarterly",
      nextDate: "2024-04-11",
    },
    subItems: [],
  },
  {
    id: 7,
    type: "expense",
    category: "Здоровье",
    amount: 3200.0,
    date: "2023-12-11",
    note: "Визит к стоматологу",
    tags: [
      { id: 1, name: "Необходимое" },
      { id: 6, name: "Здоровье" },
    ],
    recurrence: {
      type: "quarterly",
      nextDate: "2024-04-11",
    },
    subItems: [],
  },
  {
    id: 8,
    type: "expense",
    category: "Здоровье",
    amount: 3200.0,
    date: "2023-12-11",
    note: "Визит к стоматологу",
    tags: [
      { id: 1, name: "Необходимое" },
      { id: 6, name: "Здоровье" },
    ],
    recurrence: {
      type: "quarterly",
      nextDate: "2024-04-11",
    },
    subItems: [],
  },
  {
    id: 9,
    type: "expense",
    category: "Здоровье",
    amount: 3200.0,
    date: "2023-12-11",
    note: "Визит к стоматологу",
    tags: [
      { id: 1, name: "Необходимое" },
      { id: 6, name: "Здоровье" },
    ],
    recurrence: {
      type: "quarterly",
      nextDate: "2024-04-11",
    },
    subItems: [],
  },
  {
    id: 10,
    type: "expense",
    category: "Здоровье",
    amount: 3200.0,
    date: "2023-12-11",
    note: "Визит к стоматологу",
    tags: [
      { id: 1, name: "Необходимое" },
      { id: 6, name: "Здоровье" },
    ],
    recurrence: {
      type: "quarterly",
      nextDate: "2024-04-11",
    },
    subItems: [],
  },
  {
    id: 11,
    type: "expense",
    category: "Здоровье",
    amount: 3200.0,
    date: "2023-12-11",
    note: "Визит к стоматологу",
    tags: [
      { id: 1, name: "Необходимое" },
      { id: 6, name: "Здоровье" },
    ],
    recurrence: {
      type: "quarterly",
      nextDate: "2024-04-11",
    },
    subItems: [],
  },
];

export async function GET(request: Request) {
  const sortedData = data.sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate());

  return Response.json(sortedData);
}

export async function POST(request: Request) {
  const reqData: Transaction.Payload = await request.json();

  const obj: Transaction.Item = {
    ...reqData,
    id: crypto.randomUUID(),
    tags: DEFAULT_TAGS.filter((tag) => reqData.tags.includes(tag.id)),
  };

  data.push(obj);

  return Response.json(obj);
}

export async function DELETE(request: Request) {
  const reqData: Transaction.Item["id"] = await request.json();

  const transaction = data.find((transaction) => transaction.id === reqData);

  if (!transaction) {
    return Response.error();
  }

  data = data.filter((transaction) => transaction.id !== reqData);

  return Response.json(transaction);
}
