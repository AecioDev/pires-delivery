"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";

const BRAND_GRADIENT =
  "linear-gradient(135deg, #8B4513 0%, #C17A3C 50%, #D4A96A 100%)";

const sideItems = [
  { label: "Início", icon: Home, href: "/" },
  { label: "Perfil", icon: User, href: "/perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Oculta em páginas de montagem e checkout
  if (pathname.startsWith("/produto/") || pathname.startsWith("/checkout")) {
    return null;
  }

  const isCarrinhoActive = pathname.startsWith("/carrinho");

  return (
    <div className="w-full border-t dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 z-50 pb-safe">
      <div className="flex h-16 items-center justify-around px-6">
        {/* Lado esquerdo — Início */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[56px]",
            pathname === "/"
              ? "text-amber-700"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Home className={cn("h-6 w-6", pathname === "/" && "fill-current")} />
          <span className="text-[10px] font-medium">Início</span>
        </Link>

        {/* Centro — Sacola flutuante */}
        <Link
          href="/carrinho"
          className="relative flex flex-col items-center -mt-6"
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95",
              isCarrinhoActive && "ring-4 ring-amber-300/40",
            )}
            style={{ background: BRAND_GRADIENT }}
          >
            <ShoppingBag className="h-7 w-7 text-white" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-amber-800 text-[10px] font-black h-5 min-w-5 px-1 flex items-center justify-center rounded-full border-2 border-amber-600 shadow">
                {itemCount}
              </span>
            )}
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold mt-1",
              isCarrinhoActive ? "text-amber-700" : "text-muted-foreground",
            )}
          >
            Sacola
          </span>
        </Link>

        {/* Lado direito — Perfil */}
        <Link
          href="/perfil"
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[56px]",
            pathname.startsWith("/perfil")
              ? "text-amber-700"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <User
            className={cn(
              "h-6 w-6",
              pathname.startsWith("/perfil") && "fill-current",
            )}
          />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </div>
  );
}
