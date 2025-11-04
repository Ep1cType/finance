"use client"

import {Label} from "components/ui/label";
import {Input} from "components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from "components/ui/select";
import {Calendar} from "components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "components/ui/popover";
import { cn } from "shared/lib/utils";
import {Button} from "components/ui/button";
import {CalendarIcon} from "lucide-react";
import {Badge} from "components/ui/badge";
import {SyntheticEvent, useState} from "react";
import {Transaction} from "../../entities/transaction/model";
import {addTransactionFx} from "../../entities/transaction/store";

const labelList = {
	required: 'Необходимое',
	coffee: 'Кофе',
	vacation: 'Отпуск',
	dinner: 'Обед',
	test: 'Тест',
	samokat: 'Самокат'
} as const

interface Props {
	onClose: () => void;
	type: 'income' | 'expense';
}

export const Income = ({onClose, type}: Props) => {
	const [selectedTags, setSelectedTags] = useState<(keyof typeof labelList)[]>([]);

	const [amount, setAmount] = useState(0);
	const [note, setNote] = useState('');
	const [category, setCategory] = useState('');
	const [date, setDate] = useState(new Date());

	const onLabelChange = (value: keyof typeof labelList) => {
		setSelectedTags((prevState) => {
			if (prevState.includes(value)) {
				return prevState.filter(tag => tag !== value)
			}
			return [...prevState, value]
		})
	}

	const onCreateClick = async (event: SyntheticEvent) => {
		event.preventDefault();

		const newTransaction: Transaction.Item = {
			id: crypto.randomUUID(),
			tags: selectedTags,
			amount: amount,
			type: type,
			note: note,
			category: category,
			recurrence: null,
			subItems: [],
			date: date.toISOString()
		}

		await addTransactionFx(newTransaction)

		onClose();
	}

	return (
		<div className='space-y-4'>
			<div className='grid gap-3'>
				<Label htmlFor='wallet'>Кошелёк</Label>
				<Select value='Развлечение'>
					<SelectTrigger id='wallet' className='w-full'>
						<SelectValue  placeholder='Кошелёк' />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Кошелёк</SelectLabel>
							<SelectItem value='Развлечение'>Т-Банк мастеркард</SelectItem>
							<SelectItem value='Кофе'>Сбербанк кредитная карта</SelectItem>
							<SelectItem value='Тест'>Тест</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className='grid gap-3'>
				<Label htmlFor='amount'>Сумма</Label>
				<Input id='amount' value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
			</div>
			<div className='grid gap-3'>
				<Label htmlFor='description'>Описание</Label>
				<Input id='description' value={note} onChange={(e) => setNote(e.target.value)} />
			</div>
			<div className='grid gap-3'>
				<Label htmlFor='label'>Ярлык</Label>
				<ul className='flex overflow-x-auto gap-1 py-2 scrollbar-hidden'>
					{Object.entries(labelList).map(([value, name]) => (
						<li key={value} className='relative' onClick={() => onLabelChange(value as keyof typeof labelList)}>
							<Badge className='py-1 px-4' asChild variant={selectedTags.includes(value as keyof typeof labelList) ? 'default' : 'outline'}>
								<button>
									{name}
								</button>
							</Badge>
						</li>
					))}
				</ul>
			</div>
			<div className='grid gap-3'>
				<Label htmlFor='category'>Категория</Label>
				<Select onValueChange={(e) => setCategory(e)}>
					<SelectTrigger id='category' className='w-full'>
						<SelectValue placeholder='Категория' />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Категории</SelectLabel>
							<SelectItem value='Развлечение'>Развлечение</SelectItem>
							<SelectItem value='Кофе'>Кофе</SelectItem>
							<SelectItem value='Тест'>Тест</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<div className='grid gap-3'>
				<Label htmlFor='date'>Дата</Label>
				<Popover>
					<PopoverTrigger id='date' asChild>
						<Button
							variant='outline'
							className={cn(
								"w-full pl-3 text-left font-normal",
								!date && "text-muted-foreground"
							)}
						>
							{date? (
								<span>{date.toLocaleString()}</span>
							) : (
								<span>Pick a date</span>
							)}
							<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							// selected={field.value}
							// onSelect={field.onChange}
							disabled={(date) =>
								date > new Date() || date < new Date("1900-01-01")
							}
							captionLayout="dropdown"
							selected={date}
							onSelect={(e) => setDate(e || new Date())}
						/>
					</PopoverContent>
				</Popover>
			</div>
			<Button className='w-full' variant='default' size='lg' onClick={onCreateClick}>
				Добавить
			</Button>
			<Button className='w-full' variant='outline' onClick={onClose}>
				Отменить
			</Button>
		</div>
	)
}
