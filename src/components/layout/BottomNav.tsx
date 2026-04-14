"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, ShoppingCart, BarChart3 } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/transactions", label: t.nav.transactions, icon: ArrowLeftRight },
    { href: "/platforms", label: t.nav.platforms, icon: ShoppingCart },
    { href: "/reports", label: t.nav.insights, icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#E5E5EA]">
      <div className="flex items-center justify-around px-2 py-2 pb-safe max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-4 py-1 min-w-[60px]"
            >
              <Icon className={clsx("w-6 h-6 transition-colors", active ? "text-[#007AFF]" : "text-[#8E8E93]")} />
              <span className={clsx("text-[10px] font-medium transition-colors", active ? "text-[#007AFF]" : "text-[#8E8E93]")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
