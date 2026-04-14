"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, ShoppingCart, BarChart3 } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/transactions", label: "거래", icon: ArrowLeftRight },
  { href: "/platforms", label: "플랫폼", icon: ShoppingCart },
  { href: "/reports", label: "인사이트", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

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
              <Icon
                className={clsx(
                  "w-6 h-6 transition-colors",
                  active ? "text-[#007AFF]" : "text-[#8E8E93]"
                )}
              />
              <span
                className={clsx(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-[#007AFF]" : "text-[#8E8E93]"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
