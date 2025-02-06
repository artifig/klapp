"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/Separator"
import { usePathname } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"

export function SettingsButtons() {
    const { theme, setTheme } = useTheme()
    const pathname = usePathname()

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-background/50 backdrop-blur-sm p-2 shadow-sm border">
            {/* Theme Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="rounded-full"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Language Switcher */}
            <div className="flex items-center gap-1">
                <Link
                    href={pathname}
                    locale="et"
                    className={`rounded-full p-2 transition-colors hover:bg-muted ${pathname.startsWith('/et') ? 'text-primary font-medium' : 'text-muted-foreground'
                        }`}
                >
                    ET
                </Link>
                <Link
                    href={pathname}
                    locale="en"
                    className={`rounded-full p-2 transition-colors hover:bg-muted ${pathname.startsWith('/en') ? 'text-primary font-medium' : 'text-muted-foreground'
                        }`}
                >
                    EN
                </Link>
            </div>
        </div>
    )
} 