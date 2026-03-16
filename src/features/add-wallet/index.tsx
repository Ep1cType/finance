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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "components/ui/drawer";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { useUnit } from "effector-react";
import { walletDrawer } from "features/add-wallet/store";
import { Plus, X } from "lucide-react";
import { useMediaQuery } from "shared/hooks/useMediaQuery";

export const AddWallet = () => {
  const { formState, isOpen, setIsOpen, submitForm, resetForm, isSubmitting } = useUnit({
    formState: walletDrawer.$formState,
    isOpen: walletDrawer.$isOpen,
    setIsOpen: walletDrawer.toggleDrawer,
    submitForm: walletDrawer.submitForm,
    resetForm: walletDrawer.resetForm,
    isSubmitting: walletDrawer.$isSubmitting,
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCreateWallet = () => {
    submitForm({
      name: formState.name,
      balance: formState.amount,
    });
  };

  const handleClose = () => {
    resetForm();
    walletDrawer.closeDrawer();
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus />
            Добавить счет
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавление кошелька</DialogTitle>
            <DialogDescription>Введите данные для создания кошелька</DialogDescription>
          </DialogHeader>
          <div className="mx-auto w-full space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => walletDrawer.setName(e.target.value)}
                enterKeyHint="next"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // TODO: Переход к следующему пункту
                    // categoryRef.current?.click();
                  }
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="amount">Начальный баланс</Label>
              <Input
                id="amount"
                value={formState.amount}
                onChange={(e) => walletDrawer.setAmount(e.target.value)}
                enterKeyHint="send"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    // TODO: Переход к следующему пункту
                    // categoryRef.current?.click();
                  }
                }}
              />
            </div>
            <Button className="w-full" variant="default" size="lg" onClick={handleCreateWallet} disabled={isSubmitting}>
              {isSubmitting ? "Добавление..." : "Добавить"}
            </Button>
            <Button className="w-full" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Отменить
            </Button>
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
        <Button>Добавить счет</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerClose>
            <X className="absolute" />
          </DrawerClose>
          <DrawerTitle>Добавление кошелька</DrawerTitle>
          <DrawerDescription>Введите данные для создания кошелька</DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto w-full p-4 overflow-y-auto h-[80%] space-y-4">
          <Button className="w-full" variant="default" size="lg" onClick={handleCreateWallet} disabled={isSubmitting}>
            {isSubmitting ? "Добавление..." : "Добавить"}
          </Button>
          <Button className="w-full" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Отменить
          </Button>
        </div>
        {/*<DrawerFooter>*/}
        {/*	Footer*/}
        {/*</DrawerFooter>*/}
      </DrawerContent>
    </Drawer>
  );
};
