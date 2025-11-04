"use client";

import { clsx } from "clsx";
import { useUnit } from "effector-react";
import type { Transaction } from "entity/transaction/model";
import {
  ArrowRightLeft,
  Book,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Gift,
  Heart,
  Home,
  Minus,
  Plane,
  Plus,
  ShoppingCart,
  Tag,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { TransactionActionDrawer } from "widgets/transaction-action-drawer";
import { closeActionDrawer, openActionDrawer } from "../../features/action-on-transaction/store";

// Типы транзакций
const TRANSACTION_TYPES = {
  income: { label: "Доход", icon: Plus, color: "text-green-600" },
  expense: { label: "Расход", icon: Minus, color: "text-red-600" },
  transfer: { label: "Перевод", icon: ArrowRightLeft, color: "text-blue-600" },
};

// Иконки категорий
const CATEGORY_ICONS: any = {
  Здоровье: Heart,
  Транспорт: Car,
  Дом: Home,
  Путешествие: Plane,
  Покупки: ShoppingCart,
  Еда: Utensils,
  Образование: Book,
  Другое: Gift,
};

// Типы периодичности
const RECURRENCE_TYPES = {
  daily: { label: "Ежедневно", short: "день" },
  weekly: { label: "Еженедельно", short: "нед." },
  biweekly: { label: "Каждые 2 недели", short: "2 нед." },
  monthly: { label: "Ежемесячно", short: "мес." },
  quarterly: { label: "Ежеквартально", short: "кварт." },
  yearly: { label: "Ежегодно", short: "год" },
};

interface Props {
  transaction: Transaction.Item;
}

export const TransactionCard = ({ transaction }: Props) => {
  const handleOpenDrawer = useUnit(openActionDrawer);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const transactionType = TRANSACTION_TYPES[transaction.type];
  const TypeIcon = transactionType.icon;
  const CategoryIcon = CATEGORY_ICONS[transaction.category] || Gift;
  const hasSubItems = transaction.subItems && transaction.subItems.length > 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  // Обработка долгого нажатия для мобильных устройств
  const handleLongPress = () => {
    handleOpenDrawer(transaction);
  };

  const handleCloseActionDrawer = () => {
    setShowActions(false);
  };

  const handleTouchStart = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      handleLongPress();
      setIsPressed(false);
    }, 500);

    const handleTouchEnd = () => {
      clearTimeout(timer);
      setIsPressed(false);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div className="bg-white overflow-hidden select-none" onTouchStart={handleTouchStart}>
      {/* Основная информация о транзакции */}
      <div
        className={clsx("px-4 py-2", hasSubItems && "cursor-pointer")}
        onClick={() => hasSubItems && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Иконка категории */}
            <div className="p-2 bg-slate-100 rounded-lg">
              <CategoryIcon className="w-5 h-5 text-slate-700" />
            </div>

            {/* Информация о транзакции */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 text-sm">{transaction.category}</span>
                  <TypeIcon className={`w-3 h-3 ${transactionType.color}`} />
                </div>
                <span className={`text-base ${transactionType.color}`}>
                  {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                  {formatAmount(transaction.amount)}
                </span>
              </div>

              {transaction.note && (
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-600 text-sm">{transaction.note}</p>
                  {hasSubItems && (
                    <button
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      type="button"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Ярлыки */}
              {transaction.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {transaction.tags.map((tag) => (
                    <CardTag key={tag.id + tag.name} tag={tag} />
                  ))}
                </div>
              )}

              {/* Дата */}
              <div className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>

          {/* Сумма и индикатор раскрытия */}
          <div className="flex flex-col items-end">
            {/*<span className={`font-semibold text-base ${transactionType.color}`}>*/}
            {/*  {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}*/}
            {/*	{formatAmount(transaction.amount)}*/}
            {/*</span>*/}

            {/*{hasSubItems && (*/}
            {/*	<button*/}
            {/*		className="mt-2 p-1 hover:bg-slate-100 rounded transition-colors"*/}
            {/*		onClick={(e) => {*/}
            {/*			e.stopPropagation();*/}
            {/*			setIsExpanded(!isExpanded);*/}
            {/*		}}*/}
            {/*	>*/}
            {/*		{isExpanded ? (*/}
            {/*			<ChevronUp className="w-4 h-4 text-slate-400"/>*/}
            {/*		) : (*/}
            {/*			<ChevronDown className="w-4 h-4 text-slate-400"/>*/}
            {/*		)}*/}
            {/*	</button>*/}
            {/*)}*/}
          </div>
        </div>
      </div>

      {/* Подпункты транзакции */}
      {hasSubItems && isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="p-4 pt-3">
            <div className="space-y-2">
              {transaction.subItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <span className="text-sm font-medium text-slate-700">{formatAmount(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Итого:</span>
                <span className={`font-semibold ${transactionType.color}`}>
                  {transaction.type === "expense" ? "-" : ""}
                  {formatAmount(transaction.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CardTagProps {
  tag: Transaction.Tag;
}

const CardTag = ({ tag }: CardTagProps) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
      <Tag className="w-2.5 h-2.5" />
      {tag.name}
    </span>
  );
};
