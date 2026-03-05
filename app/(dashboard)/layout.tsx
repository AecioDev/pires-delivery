"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR DESKTOP */}
        <aside
          className={cn(
            "w-72 flex-col bg-slate-900 text-white transition-all",
            isDesktop ? "flex" : "hidden",
          )}
        >
          <Sidebar />
        </aside>

        {/* CONTEÚDO */}
        <div className="flex flex-1 flex-col">
          {/* HEADER MOBILE */}
          <header className="flex items-center gap-3 px-4 h-14 md:hidden bg-slate-900 text-white">
            <MobileSidebar />
            <span className={cn("font-bold", isDesktop ? "hidden" : "flex")}>
              Salgados.ai
            </span>
          </header>

          {/* MAIN */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
