"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
  // Navigation items
  const navItems = [
    { name: "Hindamine", href: "/assessment" },
    { name: "Tulemused", href: "/assessment/results" },
  ];
  
  return (
    <header className="w-full">
      {/* Top Brand Bar - using the orange gradient */}
      <div className="bg-tehnopol-gradient h-2"></div>
      
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center mb-3 md:mb-0">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-secondary">
              AI-valmiduse
              <span className="text-primary"> hindamine</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center">
          <ul className="flex flex-wrap space-x-6">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className={`text-base font-medium transition-colors hover:text-primary ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "text-primary font-bold border-b-2 border-primary"
                      : "text-secondary"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Diagonal Divider - brand element */}
      <div className="diagonal-divider h-8">
        <div className="relative h-full overflow-hidden">
          <div className="absolute inset-0 bg-primary-light opacity-30 transform -skew-y-2 origin-top-right"></div>
        </div>
      </div>
    </header>
  );
} 