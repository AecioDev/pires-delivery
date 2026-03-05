"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  ChefHat,
  Users,
  ShoppingCart,
  DollarSign,
  Settings,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Cozinha (Pedidos)",
    icon: ChefHat,
    href: "/admin/kitchen",
    color: "text-red-600",
  },
  {
    label: "Insumos",
    icon: Package,
    href: "/insumos",
    color: "text-violet-500",
  },
  {
    label: "Cardápio / Produtos",
    icon: UtensilsCrossed,
    href: "/produtos",
    color: "text-pink-700",
  },
  {
    label: "Receitas",
    icon: UtensilsCrossed, // Keeping icon or changing if needed, UtensilsCrossed was used for Products before
    href: "/receitas",
    color: "text-orange-700",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clientes",
    color: "text-emerald-500",
  },
  {
    label: "PDV (Vendas)",
    icon: ShoppingCart,
    href: "/pdv",
    color: "text-green-700",
  },
  {
    label: "Financeiro",
    icon: DollarSign,
    href: "/financeiro",
    color: "text-yellow-600",
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-white">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            {/* Logo placeholder */}
            <div className="bg-linear-to-tr from-yellow-400 to-orange-600 w-full h-full rounded-full flex items-center justify-center font-bold text-xs text-black">
              SA
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-600">
            Salgados.ai
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-slate-800">
        <Link
          href="/admin/settings"
          className={cn(
            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
            pathname === "/admin/settings"
              ? "text-white bg-white/10"
              : "text-zinc-400",
          )}
        >
          <div className="flex items-center flex-1">
            <Settings className={cn("h-5 w-5 mr-3 text-gray-500")} />
            Configurações
          </div>
        </Link>
      </div>
    </div>
  );
};
