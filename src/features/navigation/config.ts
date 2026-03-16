import { Home, PieChart, Settings, TrendingUp, Wallet } from "lucide-react";

export const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/transactions", label: "Транзакции", icon: TrendingUp },
  { href: "/wallets", label: "Счета", icon: Wallet },
  { href: "/analytics", label: "Аналитика", icon: PieChart },
  { href: "/settings", label: "Настройки", icon: Settings },
];
