import type { ReactNode } from "react";
import { Header } from "shared/ui/header";

type PageLayoutProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export const PageLayout = ({ title, action, children }: PageLayoutProps) => {
  return (
    <>
      <Header title={title} action={action} />
      <div className="mx-auto container px-4 py-6">{children}</div>
      {/*<header className="flex items-center justify-between mb-6">*/}
      {/*  <h1 className="text-2xl font-bold">{title}</h1>*/}
      {/*  {action}*/}
      {/*</header>*/}
      {/*<main className="min-h-screen pb-16 md:pb-0">{children}</main>*/}
    </>
  );
};
