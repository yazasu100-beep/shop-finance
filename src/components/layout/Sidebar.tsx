"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ShoppingCart,
  BarChart3,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/transactions", label: "수입/지출", icon: ArrowLeftRight },
  { href: "/platforms", label: "플랫폼 매출", icon: ShoppingCart },
  { href: "/reports", label: "통계/리포트", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-4 py-5 border-b border-blue-800">
        <Store className="w-6 h-6 text-blue-300" />
        <span className="text-white font-bold text-lg">쇼핑몰 가계부</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-blue-800">
        <p className="text-xs text-blue-300 text-center">
          © 2025 쇼핑몰 가계부
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-blue-900 h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed bottom-5 right-5 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="메뉴 열기"
      >
        {mobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <LayoutDashboard className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-blue-900 z-50 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
