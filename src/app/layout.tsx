import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "AI-valmiduse hindamine | Tehnopol",
  description: "Tehnopoli AI-valmiduse hindamistööriist aitab ettevõtetel hinnata oma valmisolekut AI-lahenduste kasutamiseks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="et">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
