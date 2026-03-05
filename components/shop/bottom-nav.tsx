"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Início", icon: Home, href: "/" },
  { label: "Buscar", icon: Search, href: "/buscar" },
  { label: "Sacola", icon: ShoppingBag, href: "/carrinho" },
  { label: "Perfil", icon: User, href: "/perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    // Avoid synchronous setState warning
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Hide BottomNav on product pages (customization flow) and checkout
  if (pathname.startsWith("/produto/") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <div className="w-full border-t bg-white shrink-0 z-50 pb-safe">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] relative",
                isActive
                  ? "text-orange-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn("h-6 w-6", isActive && "fill-current")}
                />
                {item.label === "Sacola" && mounted && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
