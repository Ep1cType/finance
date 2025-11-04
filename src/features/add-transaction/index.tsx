"use client";

import { Button } from "components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import { useUnit } from "effector-react";
import { $isOpenAddTransactionDrawer, toggleDrawer } from "features/add-transaction/store";
import { X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useMediaQuery } from "shared/hooks/useMediaQuery";
import { IncomeExpenseForm } from "widgets/income-expense-form";
import { TransferForm } from "widgets/transfer-form";

type TabList = "income" | "expenses" | "transfer";

const tabsName: Record<TabList, string> = {
  income: "Доход",
  expenses: "Расход",
  transfer: "Перевод",
};

export const AddTransaction = () => {
  const [isOpen, setIsOpen] = useUnit([$isOpenAddTransactionDrawer, toggleDrawer]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onClose = () => {
    setIsOpen(false);
  };

  const tabsContent: Record<TabList, ReactNode> = {
    income: <IncomeExpenseForm onClose={onClose} type="income" />,
    expenses: <IncomeExpenseForm onClose={onClose} type="expense" />,
    transfer: <TransferForm onClose={onClose} />,
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Добавить транзакцию</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавление транзакции</DialogTitle>
            <DialogDescription>Set your daily activity goal.</DialogDescription>
          </DialogHeader>
          <div className="mx-auto w-full">
            {/*TODO: Запоминать последний выбранный вариант*/}
            <Tabs defaultValue={Object.keys(tabsName)[0]}>
              <TabsList className="mb-5">
                {Object.entries(tabsName).map(([value, name]) => (
                  <TabsTrigger key={value} value={value}>
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(tabsContent).map(([value, component]) => (
                <TabsContent key={value} value={value}>
                  {component}
                </TabsContent>
              ))}
            </Tabs>
          </div>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    // <Drawer snapPoints={[90]} fadeFromIndex={0}>
    <Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
      <DrawerTrigger asChild>
        <Button>Добавить транзакцию</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerClose>
            <X className="absolute" />
          </DrawerClose>
          <DrawerTitle>Добавление транзакции</DrawerTitle>
          {/*<DrawerDescription>Set your daily activity goal.</DrawerDescription>*/}
        </DrawerHeader>
        <div className="mx-auto w-full p-4 overflow-y-auto h-[80%]">
          {/*TODO: Запоминать последний выбранный вариант*/}
          <Tabs defaultValue={Object.keys(tabsName)[0]}>
            <TabsList className="mb-2 w-full">
              {Object.entries(tabsName).map(([value, name]) => (
                <TabsTrigger key={value} value={value}>
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(tabsContent).map(([value, component]) => (
              <TabsContent key={value} value={value}>
                {component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        {/*<DrawerFooter>*/}
        {/*	Footer*/}
        {/*</DrawerFooter>*/}
      </DrawerContent>
    </Drawer>
  );
};
