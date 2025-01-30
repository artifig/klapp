import type { Metadata } from "next";
import { EmbedProvider } from "@/context/EmbedContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Readiness Assessment",
  description: "Assess your company's AI readiness level",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <EmbedProvider>
          {children}
        </EmbedProvider>
      </body>
    </html>
  );
}
