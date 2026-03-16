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
import { $userInfo } from "entity/user/store";
import { $wallets } from "entity/wallet/store";
import { CalendarIcon } from "lucide-react";
import { type SyntheticEvent, useState } from "react";
import { cn } from "shared/lib/utils";

interface Props {
  onClose: () => void;
}

export const TransferForm = ({ onClose }: Props) => {
  const [userInfo, wallets] = useUnit([$userInfo, $wallets]);

  const [fromWallet, setFromWallet] = useState(String(userInfo?.wallets[0].id));
  const [toWallet, setToWallet] = useState(String(userInfo?.wallets[1].id));
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());

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
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
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
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
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
