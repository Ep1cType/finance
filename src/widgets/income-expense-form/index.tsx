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
import { $categories } from "entity/category/store";
import type { Transaction } from "entity/transaction/model";
import { $userInfo } from "entity/user/store";
import { $defaultWallet, $wallets } from "entity/wallet/store";
import { transactionDrawer } from "features/add-transaction/store";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
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
  const { formState, submitForm, resetForm, isSubmitting, isOpen, setIsOpen, defaultWallet } = useUnit({
    formState: transactionDrawer.$formState,
    isOpen: transactionDrawer.$isOpen,
    setIsOpen: transactionDrawer.toggleDrawer,
    submitForm: transactionDrawer.submitForm,
    resetForm: transactionDrawer.resetForm,
    isSubmitting: transactionDrawer.$isSubmitting,
    defaultWallet: $defaultWallet,
  });

  // Subscribe to stores
  const [userInfo, wallets, categories] = useUnit([$userInfo, $wallets, $categories]);

  const categoryRef = useRef<HTMLButtonElement>(null);

  const onCreateClick = async (event: SyntheticEvent) => {
    event.preventDefault();

    const validSubitems = formState.subitems
      .filter((subitem) => subitem.name.trim() && subitem.amount)
      .map((subitem) => ({ ...subitem, amount: String(subitem.amount) }));

    const newTransaction: Transaction.Payload = {
      // tags: formState.selectedTags,
      amount: String(formState.amount),
      type,
      // note: formState.note,
      categoryId: formState.category,
      // recurrence: null,
      // subItems: [],
      date: formState.date.toISOString(),
      description: formState.note,
      walletId: formState.wallet || defaultWallet?.id,
      subitems: validSubitems.length > 0 ? validSubitems : undefined,
    };

    submitForm(newTransaction);
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Кошелёк */}
      {userInfo && (
        <div className="grid gap-2.5">
          <Label htmlFor="wallet">Кошелёк</Label>
          <Select
            value={formState.wallet || defaultWallet?.id}
            onValueChange={(value) => transactionDrawer.setWallet(value)}
          >
            <SelectTrigger id="wallet" className="w-full">
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
      )}

      {/* Сумма */}
      <PriceInput
        label="Сумма"
        currency="₽"
        value={formState.amount}
        onChange={(value) => transactionDrawer.setAmount(value)}
        enterKeyHint="next"
        onEnterPress={() => {}}
      />

      {/* Описание */}
      <div className="grid gap-2.5">
        <Label htmlFor="description">Описание</Label>
        <Input
          id="description"
          value={formState.note}
          onChange={(e) => transactionDrawer.setNote(e.target.value)}
          enterKeyHint="next"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              categoryRef.current?.click();
            }
          }}
        />
      </div>

      {/* Ярлык */}
      <div className="grid gap-2.5">
        <Label htmlFor="label">Ярлык</Label>
        <ul className="flex overflow-x-auto gap-1 py-2 scrollbar-hidden">
          {userInfo?.tags.map((tag) => (
            <li key={tag.id} className="relative" onClick={() => transactionDrawer.toggleTag(tag.id)}>
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

      {/* Категория */}
      <div className="grid gap-2.5">
        <Label htmlFor="category">Категория</Label>
        <Select value={formState.category} onValueChange={(value) => transactionDrawer.setCategory(value)}>
          <SelectTrigger id="category" ref={categoryRef} className="w-full">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Категории</SelectLabel>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* НОВыЙ КОНТЕНТ */}
      <div className="grid gap-2.5" aria-describedby="subitems-description">
        <p className="text-sm font-medium">Подпозиции</p>
        <p id="subitems-description" className="text-xs text-muted-foreground">
          Необязательно. Добавьте, если хотите разбить транзакцию на части.
        </p>

        {formState.subitems.length === 0 && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Подпозиций пока нет.
          </p>
        )}

        {formState.subitems.map((subitem, index) => (
          <div key={`subitem-${index}`} className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`subitem-name-${index}`}>Название #{index + 1}</Label>
                <Input
                  id={`subitem-name-${index}`}
                  value={subitem.name}
                  placeholder={index === 0 ? "Например, Продукты" : ""}
                  onChange={(event) =>
                    transactionDrawer.updateSubitem({ index, field: "name", value: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                {/*<Label htmlFor={`subitem-amount-${index}`}>Сумма #{index + 1}</Label>*/}
                <PriceInput
                  // id={`subitem-amount-${index}`}
                  label={`Сумма #${index + 1}`}
                  currency="₽"
                  value={subitem.amount}
                  onChange={(value) => transactionDrawer.updateSubitem({ index, field: "amount", value: value })}
                  enterKeyHint="next"
                  onEnterPress={() => {}}
                />
                {/*<Input*/}
                {/*  id={`subitem-amount-${index}`}*/}
                {/*  type="number"*/}
                {/*  inputMode="decimal"*/}
                {/*  min="0"*/}
                {/*  step="0.01"*/}
                {/*  value={subitem.amount}*/}
                {/*  placeholder={index === 0 ? "0" : ""}*/}
                {/*  onChange={(event) =>*/}
                {/*    transactionDrawer.updateSubitem({ index, field: "amount", value: event.target.value })*/}
                {/*  }*/}
                {/*/>*/}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => transactionDrawer.removeSubitem(index)}
              aria-label={`Удалить подпозицию ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" className="w-full" onClick={() => transactionDrawer.addSubitem()}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Добавить подпозицию
        </Button>
      </div>
      {/* НОВыЙ КОНТЕНТ */}

      {/* Дата */}
      <div className="grid gap-2.5">
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
              onSelect={(e) => transactionDrawer.setDate(e || new Date())}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/*<div className="grid gap-2.5">*/}
      {/*  <Label htmlFor="subTransaction">Подтранзакция</Label>*/}
      {/*  <Input*/}
      {/*    id="subTransaction"*/}
      {/*    value={formState.note}*/}
      {/*    onChange={(e) => handleSetNote(e.target.value)}*/}
      {/*    enterKeyHint="next"*/}
      {/*    onKeyDown={(e) => {*/}
      {/*      if (e.key === "Enter") {*/}
      {/*        e.preventDefault();*/}
      {/*        categoryRef.current?.click();*/}
      {/*      }*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</div>*/}

      <Button className="w-full" variant="default" size="lg" onClick={onCreateClick} disabled={isSubmitting}>
        {isSubmitting ? "Добавление..." : "Добавить"}
      </Button>
      <Button className="w-full" variant="outline" onClick={handleClose} disabled={isSubmitting}>
        Отменить
      </Button>
    </div>
  );
};
