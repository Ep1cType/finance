"use client";

import { InputOtp } from "components/inputOtp";
import { OTPInput } from "components/otp";
import { Button } from "components/ui/button";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "components/ui/chart";
import { Switch } from "components/ui/switch";
import { useUnit } from "effector-react";
import type { Transaction } from "entity/transaction/model";
import {
  $groupedTransactionList,
  $transactionList,
  fetchTransactionListFx,
  TransactionGate,
} from "entity/transaction/store";
import { AddTransaction } from "features/add-transaction";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageLayout } from "shared/ui/page-layout";
import { TransactionActionDrawer } from "widgets/transaction-action-drawer";
import { TransactionCard } from "widgets/transaction-card";

// Примерные данные

export default function Home() {
  const [transactions, pending] = useUnit([$transactionList, fetchTransactionListFx.pending]);
  const [groupedTransactions] = useUnit([$groupedTransactionList]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const chartConfig = {
    income: {
      label: "Доходы",
      color: "#10b981", // emerald-500
    },
    expense: {
      label: "Расходы",
      color: "#f97316", // orange-500
    },
    balance: {
      label: "Баланс",
      color: "#3b82f6", // blue-500
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; income: number; expense: number; net: number }> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleDateString("ru-RU", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          income: 0,
          expense: 0,
          net: 0,
        };
      }

      if (transaction.type === "income") {
        monthlyData[monthYear].income += Number(transaction.amount);
      } else if (transaction.type === "expense") {
        monthlyData[monthYear].expense += Number(transaction.amount);
      }
      // transfers are not included in income/expense chart
    });

    // Calculate net for each month
    Object.values(monthlyData).forEach((data) => {
      data.net = data.income - data.expense;
    });

    // Sort by date (newest first for display, but we'll reverse for chart)
    return Object.values(monthlyData).sort((a, b) => {
      const parseMonthYear = (monthYear: string) => {
        const [month, year] = monthYear.split(" ");
        const monthNames = [
          "янв.",
          "февр.",
          "мар.",
          "апр.",
          "мая",
          "июня",
          "июля",
          "авг.",
          "сент.",
          "окт.",
          "нояб.",
          "дек.",
        ];
        const monthIndex = monthNames.indexOf(month.toLowerCase());
        return new Date(parseInt(year), monthIndex, 1);
      };

      // For chart, show oldest to newest (left to right)
      return parseMonthYear(a.month).getTime() - parseMonthYear(b.month).getTime();
    });
  }, [transactions]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("ru-RU", {}).format(new Date(date));
  };

  const calculateTotalMonthAmount = (group: Transaction.GroupedByDate) => {
    return group.transactions.reduce((previousValue, currentValue) => {
      if (currentValue.type === "income") {
        return Number(previousValue) + Number(currentValue.amount);
      }
      return Number(previousValue) - Number(currentValue.amount);
    }, 0);
  };

  const register = async () => {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "den138@mail.ru",
        password: "53779e4c",
        firstName: "Denis",
        lastName: "Chernykh",
      }),
    });

    const data = response.json();
    console.log("register", data);
  };

  const login = async () => {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: "den138@mail.ru",
        password: "53779e4c",
      }),
    });

    const data = response.json();
    console.log("login", data);
  };

  const me = async () => {
    const response = await fetch("http://localhost:3003/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      // body: JSON.stringify({
      //   email: "DenRus38@hotmail.com",
      //   password: "53779e4c",
      // }),
    });

    const data = response.json();
    console.log("me", data);
  };

  const wallets = async () => {
    const response = await fetch("http://localhost:3000/wallets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      // body: JSON.stringify({
      //   email: "DenRus38@hotmail.com",
      //   password: "53779e4c",
      // }),
    });

    const data = response.json();
    console.log("wallets", data);
  };

  const profile = async () => {
    const response = await fetch("http://localhost:3000/users/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      // body: JSON.stringify({
      //   email: "DenRus38@hotmail.com",
      //   password: "53779e4c",
      // }),
    });

    const data = response.json();
    console.log("profile", data);
  };

  const createOneT = async () => {
    const response = await fetch("http://localhost:3000/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type: "income",
        walletId: "56ce32bc-7c2c-4088-b2c3-7563eba16eaf",
        amount: "1337.85",
        description: "SomeT",
        date: new Date(),
        categoryId: "699ced88-9772-4da6-9d2d-1452c2e8ec12",
        tagIds: [],
      }),
    });

    const data = response.json();
    console.log("login", data);
  };

  const createTwoT = async () => {
    const response = await fetch("http://localhost:3000/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type: "income",
        walletId: "56ce32bc-7c2c-4088-b2c3-7563eba16eaf",
        description: "SomeT",
        date: new Date(),
        categoryId: "699ced88-9772-4da6-9d2d-1452c2e8ec12",
        tagIds: [],
        subitems: [
          {
            name: "Хлеб",
            amount: "500",
          },
          {
            name: "Пирожок",
            amount: "100",
          },
        ],
      }),
    });

    const data = response.json();
    console.log("login", data);
  };

  const cat = async () => {
    const response = await fetch("http://localhost:3000/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      // body: JSON.stringify({
      //   email: "DenRus38@hotmail.com",
      //   password: "53779e4c",
      // }),
    });

    const data = response.json();
    console.log("cat", data);
  };

  const tags = async () => {
    const response = await fetch("http://localhost:3000/tags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      // body: JSON.stringify({
      //   email: "DenRus38@hotmail.com",
      //   password: "53779e4c",
      // }),
    });

    const data = response.json();
    console.log("tags", data);
  };

  return (
    <PageLayout title="Main" action={<AddTransaction />}>
      <Button onClick={register}>REGISTER</Button>
      <Button onClick={login}>Login</Button>
      <Button onClick={me}>ME</Button>
      <Button onClick={wallets}>Wallets</Button>
      <Button onClick={profile}>Profile</Button>
      <Button onClick={cat}>Cate</Button>
      <Button onClick={tags}>Tags</Button>
      <Button onClick={createOneT}>TransOne</Button>
      <Button onClick={createTwoT}>TransTwo</Button>
      <TransactionGate />
      <div className="mx-auto container">
        <div>
          {chartData.length > 0 && (
            <div className="bg-white rounded-2xl py-4 md:p-6 shadow-lg border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center">📊 Доходы и расходы</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <span className="text-sm text-gray-600">Доходы</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-600">Расходы</span>
                  </div>
                </div>
              </div>

              <ChartContainer config={chartConfig} className="h-64 md:h-80 w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                  barCategoryGap="40%"
                  maxBarSize={30}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    angle={0}
                    textAnchor="middle"
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    width={30}
                    tickFormatter={(value) => {
                      if (value >= 1000000) {
                        return `${(value / 1000000).toFixed(0)}М`;
                      } else if (value >= 1000) {
                        return `${(value / 1000).toFixed(0)}К`;
                      }
                      return value.toString();
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          new Intl.NumberFormat("ru-RU", {
                            style: "currency",
                            currency: "RUB",
                            maximumFractionDigits: 0,
                          }).format(value as number),
                          " ",
                          name,
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                    }
                  />
                  <Bar
                    dataKey="income"
                    name={chartConfig.income.label}
                    fill={chartConfig.income.color}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar dataKey="expense" name={chartConfig.expense.label} fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </div>
        <div className="bg-white border-b border-slate-200 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-semibold text-slate-900">Транзакции</h1>
          </div>
        </div>
        <div className="py-4">
          {groupedTransactions.length <= 0 && <p>Простите, ничего не найдено</p>}

          {groupedTransactions.map((group) => {
            const totalAmount = calculateTotalMonthAmount(group);

            return (
              <div key={group.date}>
                <div className="sticky top-0 flex items-center justify-between bg-secondary px-4 py-1 text-sm">
                  <h2 className="text-gray-700 capitalize">{formatDate(group.date)}</h2>
                  <p className={totalAmount > 0 ? "text-green-600" : "text-red-600"}>
                    {totalAmount > 0 && "+"}
                    {formatAmount(totalAmount)}
                  </p>
                </div>
                <div className="divide-y">
                  {group.transactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </div>
            );
          })}

          {/*{Object.entries(groupedTransactions).map(([date, transactions]) => {*/}
          {/*	return (*/}
          {/*		<div key={date}>*/}
          {/*			<div className='sticky top-0 flex items-center justify-between bg-secondary px-4 py-1 text-sm'>*/}
          {/*				<h2 className="text-gray-700 capitalize">*/}
          {/*					{date}*/}
          {/*				</h2>*/}
          {/*			</div>*/}
          {/*			<div className='divide-y'>*/}
          {/*				{transactions.map((transaction) => (*/}
          {/*					<TransactionCard key={transaction.id} transaction={transaction}/>*/}
          {/*				))}*/}
          {/*			</div>*/}
          {/*		</div>*/}
          {/*	)*/}
          {/*})}*/}
        </div>
      </div>
      <TransactionActionDrawer />
    </PageLayout>
  );
}
