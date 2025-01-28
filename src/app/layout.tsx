import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Maturity Assessment",
  description: "Assess your company's digital maturity level",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
