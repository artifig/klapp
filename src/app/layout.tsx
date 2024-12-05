import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

// Custom fonts
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

// Metadata for the app
export const metadata: Metadata = {
  title: "Tehnopal",
  description: "Your AI matchmaking platform.",
};

// Root layout
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
        {/* Menu Bar */}
        <header className="bg-gray-800 text-white shadow-md">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="text-2xl font-bold text-blue-400">
                Tehnopal
              </Link>

              {/* Menu Links */}
              <div className="hidden sm:flex space-x-8">
                <Link
                  href="/"
                  className="text-sm font-medium hover:underline hover:underline-offset-4"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium hover:underline hover:underline-offset-4"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium hover:underline hover:underline-offset-4"
                >
                  Contact
                </Link>
              </div>

              {/* Optional: Add a call-to-action button */}
              <Link
                href="/get-started"
                className="hidden sm:inline-block bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-4">
          <p>© 2024 Tehnopal. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
