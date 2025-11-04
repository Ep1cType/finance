"use client";

import { Badge } from "components/ui/badge";
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
import { $userInfo } from "entity/user/store";
import {
  $incomeExpenseFormState,
  $isSubmitting,
  $selectedWallet,
  resetForm,
  setAmount,
  setCategory,
  setDate,
  setNote,
  setWallet,
  submitForm,
  toggleTag,
} from "features/add-transaction/store";
import { CalendarIcon } from "lucide-react";
import { type SyntheticEvent, useRef } from "react";
import { cn } from "shared/lib/utils";
import { PriceInput } from "shared/ui/price-input";

const labelList = {
  required: "Необходимое",
  coffee: "Кофе",
  vacation: "Отпуск",
  dinner: "Обед",
  test: "Тест",
  samokat: "Самокат",
} as const;

interface Props {
  onClose: () => void;
  type: "income" | "expense";
}

export const IncomeExpenseForm = ({ onClose, type }: Props) => {
  // Subscribe to stores
  const [userInfo, formState, selectedWallet, isSubmitting] = useUnit([
    $userInfo,
    $incomeExpenseFormState,
    $selectedWallet,
    $isSubmitting,
  ]);

  const categoryRef = useRef<HTMLButtonElement>(null);

  const [
    handleSetAmount,
    handleSetNote,
    handleSetCategory,
    handleSetDate,
    handleSetWallet,
    handleToggleTag,
    handleResetForm,
    handleSubmit,
  ] = useUnit([setAmount, setNote, setCategory, setDate, setWallet, toggleTag, resetForm, submitForm]);

  const onCreateClick = async (event: SyntheticEvent) => {
    event.preventDefault();

    const newTransaction: Transaction.Payload = {
      tags: formState.selectedTags,
      amount: formState.amount,
      type: type,
      note: formState.note,
      category: formState.category,
      recurrence: null,
      subItems: [],
      date: formState.date.toISOString(),
    };

    handleSubmit(newTransaction);
    onClose();
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  return (
    <div className="space-y-4">
      {userInfo && (
        <div className="grid gap-3">
          <Label htmlFor="wallet">Кошелёк</Label>
          <Select value={selectedWallet} onValueChange={handleSetWallet}>
            <SelectTrigger id="wallet" className="w-full">
              <SelectValue placeholder="Кошелёк" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Кошелёк</SelectLabel>
                {userInfo.wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={String(wallet.id)}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      <PriceInput
        label="Сумма"
        currency="₽"
        value={formState.amount}
        onChange={handleSetAmount}
        enterKeyHint="next"
        onEnterPress={() => {}}
      />

      <div className="grid gap-3">
        <Label htmlFor="description">Описание</Label>
        <Input
          id="description"
          value={formState.note}
          onChange={(e) => handleSetNote(e.target.value)}
          enterKeyHint="next"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              categoryRef.current?.click();
            }
          }}
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="label">Ярлык</Label>
        <ul className="flex overflow-x-auto gap-1 py-2 scrollbar-hidden">
          {userInfo?.tags.map((tag) => (
            <li key={tag.id} className="relative" onClick={() => handleToggleTag(tag.id)}>
              <Badge
                className="py-1 px-4"
                asChild
                variant={formState.selectedTags.includes(tag.id) ? "default" : "outline"}
              >
                <span>{tag.name}</span>
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="category">Категория</Label>
        <Select value={formState.category} onValueChange={handleSetCategory}>
          <SelectTrigger id="category" ref={categoryRef} className="w-full">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Категории</SelectLabel>
              <SelectItem value="Развлечение">Развлечение</SelectItem>
              <SelectItem value="Кофе">Кофе</SelectItem>
              <SelectItem value="Тест">Тест</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="date">Дата</Label>
        <Popover>
          <PopoverTrigger id="date" asChild>
            <Button
              variant="outline"
              className={cn("w-full pl-3 text-left font-normal", !formState.date && "text-muted-foreground")}
            >
              {formState.date ? <span>{formState.date.toLocaleString()}</span> : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              captionLayout="dropdown"
              selected={formState.date}
              onSelect={(e) => handleSetDate(e || new Date())}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button className="w-full" variant="default" size="lg" onClick={onCreateClick} disabled={isSubmitting}>
        {isSubmitting ? "Добавление..." : "Добавить"}
      </Button>
      <Button className="w-full" variant="outline" onClick={handleClose} disabled={isSubmitting}>
        Отменить
      </Button>
    </div>
  );
};
