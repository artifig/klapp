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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <EmbedProvider>
          {children}
        </EmbedProvider>
      </body>
    </html>
  );
}
