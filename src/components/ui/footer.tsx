"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-secondary text-white mt-auto">
      {/* Diagonal Divider - brand element */}
      <div className="diagonal-divider h-8 transform rotate-180">
        <div className="relative h-full overflow-hidden">
          <div className="absolute inset-0 bg-primary opacity-30 transform -skew-y-2 origin-bottom-left"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="font-bold text-xl">
              <span className="text-white">AI-valmiduse</span>
              <span className="text-primary-light"> hindamine</span>
            </div>
            <p className="text-sm text-gray-300">
              Tehnopoli AI-valmiduse hindamistööriist aitab ettevõtetel hinnata oma valmisolekut AI-lahenduste kasutamiseks.
            </p>
          </div>
          
          {/* Links Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Kiirlingid</h3>
            <ul className="space-y-2">
              <li><Link href="/assessment" className="text-gray-300 hover:text-primary-light transition-colors">Hindamine</Link></li>
              <li><Link href="/assessment/results" className="text-gray-300 hover:text-primary-light transition-colors">Tulemused</Link></li>
            </ul>
          </div>
          
          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Kontakt</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Teaduspargi 6</li>
              <li>12618 Tallinn</li>
              <li>+372 480 0000</li>
              <li>info@tehnopol.ee</li>
            </ul>
          </div>
          
          {/* Slogan Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Tehnopol</h3>
            <p className="text-primary-light font-bold">UNLOCKING THE POTENTIAL</p>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.facebook.com/Tehnopol" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary-light transition-colors">Facebook</a>
              <a href="https://www.linkedin.com/company/tehnopol" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary-light transition-colors">LinkedIn</a>
              <a href="https://twitter.com/tehnopol" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-primary-light transition-colors">Twitter</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Tehnopol. Kõik õigused kaitstud.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link href="/privacy-policy" className="hover:text-primary-light transition-colors">Privaatsuspoliitika</Link>
              <Link href="/terms" className="hover:text-primary-light transition-colors">Kasutustingimused</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 