import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tehnopal",
  description: "AI Matchmaking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Tehnopal</h1>
            <nav>
              <a href="/" className="px-4 hover:underline">
                Home
              </a>
              <a href="/profile" className="px-4 hover:underline">
                Profile
              </a>
              <a href="/assessment" className="px-4 hover:underline">
                Assessment
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-grow">{children}</main>
        <footer className="bg-gray-800 text-white text-center p-4">
          <p>© {new Date().getFullYear()} Tehnopal. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
