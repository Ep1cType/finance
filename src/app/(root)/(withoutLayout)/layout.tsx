import { Metadata } from "next";

export const metadata: Metadata = {
  title: "auth",
};

export default function WithLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
