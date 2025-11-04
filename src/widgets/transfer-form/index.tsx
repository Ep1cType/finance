"use client";

import { Button } from "components/ui/button";
import { Calendar } from "components/ui/calendar";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { useUnit } from "effector-react";
import type { Transaction } from "entity/transaction/model";
import { addTransactionFx } from "entity/transaction/store";
import { $userInfo } from "entity/user/store";
import { CalendarIcon } from "lucide-react";
import { type SyntheticEvent, useCallback, useState } from "react";
import { cn } from "shared/lib/utils";

interface Props {
  onClose: () => void;
}

export const TransferForm = ({ onClose }: Props) => {
  const [userInfo] = useUnit([$userInfo]);

  const [fromWallet, setFromWallet] = useState(String(userInfo?.wallets[0].id));
  const [toWallet, setToWallet] = useState(String(userInfo?.wallets[1].id));
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());

  const { numbers, generateNumbers } = useRandomNumber();

  const handleGenerate = () => {
    generateNumbers(0, 1000, 5);
  };

  const onCreateClick = async (event: SyntheticEvent) => {
    event.preventDefault();

    // const newTransaction: Transaction.Item = {
    //   id: crypto.randomUUID(),
    //   // tags: selectedTags,
    //   amount: amount,
    //   // type: type,
    //   note: note,
    //   // category: category,
    //   recurrence: null,
    //   subItems: [],
    //   date: date.toISOString(),
    // };
    //
    // await addTransactionFx(newTransaction);

    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <Label htmlFor="amount">Сумма</Label>
        <Input id="amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="wallet">Из кошелька</Label>
        <Select value={fromWallet} onValueChange={(e) => setFromWallet(e)}>
          <SelectTrigger id="from_wallet" className="w-full">
            <SelectValue placeholder="Кошелёк" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Кошелёк</SelectLabel>
              {userInfo &&
                userInfo.wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={String(wallet.id)}>
                    {wallet.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="wallet">В кошелёк</Label>
        <Select value={toWallet} onValueChange={(e) => setToWallet(e)}>
          <SelectTrigger id="to_wallet" className="w-full">
            <SelectValue placeholder="Кошелёк" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Кошелёк</SelectLabel>
              {userInfo &&
                userInfo.wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={String(wallet.id)}>
                    {wallet.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="description">Описание</Label>
        <Input id="description" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="date">Дата</Label>
        <Popover>
          <PopoverTrigger id="date" asChild>
            <Button
              variant="outline"
              className={cn("w-full pl-3 text-left font-normal", !date && "text-muted-foreground")}
            >
              {date ? <span>{date.toLocaleString()}</span> : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              // selected={field.value}
              // onSelect={field.onChange}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              captionLayout="dropdown"
              selected={date}
              onSelect={(e) => setDate(e || new Date())}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Button className="w-full" variant="default" size="lg" onClick={onCreateClick}>
        Добавить
      </Button>
      <Button className="w-full" variant="outline" onClick={onClose}>
        Отменить
      </Button>
    </div>
  );
};

// Custom hook for random number generation
export function useRandomNumber() {
  const [numbers, setNumbers] = useState([]);

  const generateNumbers = useCallback((min: any, max: any, count: any, allowDuplicates = true) => {
    const newNumbers = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      let number = Math.floor(Math.random() * (max - min + 1)) + min;

      if (!allowDuplicates) {
        while (used.has(number)) {
          number = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        used.add(number);
      }

      newNumbers.push(number);
    }

    setNumbers(newNumbers as any);
    return newNumbers;
  }, []);

  return { numbers, generateNumbers };
}
