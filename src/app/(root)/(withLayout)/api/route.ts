import {Transaction} from "entity/transaction/model";

const data: Transaction.Item[] = [
	{
		id: 1,
		type: 'expense',
		category: 'Покупки',
		amount: 3450.00,
		date: '2024-01-15',
		note: 'Покупка продуктов в Перекрестке',
		tags: ['Необходимое', 'Еда'],
		recurrence: {
			type: 'weekly',
			nextDate: '2024-01-22'
		},
		subItems: [
			{name: 'Молоко', amount: 89.90},
			{name: 'Хлеб', amount: 45.00},
			{name: 'Яйца', amount: 120.00},
			{name: 'Овощи', amount: 340.00},
			{name: 'Мясо', amount: 680.00},
			{name: 'Фрукты', amount: 450.00},
			{name: 'Остальное', amount: 1725.10}
		]
	},
	{
		id: 2,
		type: 'income',
		category: 'Работа',
		amount: 85000.00,
		date: '2024-01-10',
		note: 'Зарплата за декабрь',
		tags: ['Зарплата'],
		recurrence: {
			type: 'monthly',
			nextDate: '2024-02-10'
		},
		subItems: []
	},
	{
		id: 3,
		type: 'expense',
		category: 'Транспорт',
		amount: 1500.00,
		date: '2024-01-14',
		note: 'Заправка автомобиля',
		tags: ['Необходимое'],
		recurrence: null,
		subItems: []
	},
	{
		id: 4,
		type: 'transfer',
		category: 'Перевод',
		amount: 10000.00,
		date: '2023-10-13',
		note: '',
		// tags: ['Накопления'],
		tags: [],
		recurrence: {
			type: 'monthly',
			nextDate: '2024-02-13'
		},
		subItems: []
	},
	{
		id: 5,
		type: 'expense',
		category: 'Еда',
		amount: 450.00,
		date: '2023-11-12',
		note: 'Кофейня',
		tags: ['Кофе', 'Желания'],
		recurrence: {
			type: 'daily',
			nextDate: '2024-01-13'
		},
		subItems: [
			{name: 'Капучино', amount: 250.00},
			{name: 'Чизкейк', amount: 200.00}
		]
	},
	{
		id: 6,
		type: 'expense',
		category: 'Здоровье',
		amount: 3200.00,
		date: '2023-12-11',
		note: 'Визит к стоматологу',
		tags: ['Необходимое', 'Здоровье'],
		recurrence: {
			type: 'quarterly',
			nextDate: '2024-04-11'
		},
		subItems: []
	},
	{
		id: 7,
		type: 'expense',
		category: 'Здоровье',
		amount: 3200.00,
		date: '2023-12-11',
		note: 'Визит к стоматологу',
		tags: ['Необходимое', 'Здоровье'],
		recurrence: {
			type: 'quarterly',
			nextDate: '2024-04-11'
		},
		subItems: []
	},
	{
		id: 8,
		type: 'expense',
		category: 'Здоровье',
		amount: 3200.00,
		date: '2023-12-11',
		note: 'Визит к стоматологу',
		tags: ['Необходимое', 'Здоровье'],
		recurrence: {
			type: 'quarterly',
			nextDate: '2024-04-11'
		},
		subItems: []
	},
	{
		id: 9,
		type: 'expense',
		category: 'Здоровье',
		amount: 3200.00,
		date: '2023-12-11',
		note: 'Визит к стоматологу',
		tags: ['Необходимое', 'Здоровье'],
		recurrence: {
			type: 'quarterly',
			nextDate: '2024-04-11'
		},
		subItems: []
	},
	{
		id: 10,
		type: 'expense',
		category: 'Здоровье',
		amount: 3200.00,
		date: '2023-12-11',
		note: 'Визит к стоматологу',
		tags: ['Необходимое', 'Здоровье'],
		recurrence: {
			type: 'quarterly',
			nextDate: '2024-04-11'
		},
		subItems: []
	},
	{
		id: 11,
		type: 'expense',
		category: 'Здоровье',
		amount: 3200.00,
		date: '2023-12-11',
		note: 'Визит к стоматологу',
		tags: ['Необходимое', 'Здоровье'],
		recurrence: {
			type: 'quarterly',
			nextDate: '2024-04-11'
		},
		subItems: []
	}
]


export async function GET(request: Request) {
	const sortedData = data.sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate())

	return Response.json(sortedData);
}

export async function POST(request: Request) {
	const obj: Transaction.Item = {
		id: 1000,
		amount: 1000,
		recurrence: null,
		date: '2023-05-11',
		note: '',
		category: '',
		tags: [],
		type: 'expense',
		subItems: []
	}

	const reqData = await request.json();

	data.push(reqData)

	return Response.json(reqData)
}

