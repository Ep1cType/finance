import {User} from "entity/user/model";

const user: User.Entity = {
	id: 1,
	username: 'EpicType',
	email: 'DenRus38@hotmail.com',
	wallets: [
		{
			id: 1,
			name: 'Кошелёк для наличных',
			amount: 125000,
			history: [
				{
					date: '2025-09-01',
					value: 100000
				}
			]
		},
		{
			id: 2,
			name: "Кредитная карта",
			amount: 210000,
			history: []
		}
	]
}

export async function GET(request: Request) {
	return Response.json(user)
}
