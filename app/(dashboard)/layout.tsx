"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { getSettings } from "@/actions/settings";
import { Store } from "lucide-react";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [storeName, setStoreName] = useState("Pires Delivery");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings) {
        setStoreName(settings.name || "Pires Delivery");
        setLogoUrl(settings.logoUrl || null);
      }
    });
  }, []);

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
          <Sidebar storeName={storeName} logoUrl={logoUrl} />
        </aside>

        {/* CONTEÚDO */}
        <div className="flex flex-1 flex-col">
          {/* HEADER MOBILE */}
          <header
            className={cn(
              "items-center gap-3 px-4 h-14 bg-slate-900 text-white",
              isDesktop ? "hidden" : "flex",
            )}
          >
            <MobileSidebar storeName={storeName} logoUrl={logoUrl} />
            <div
              className={cn(
                "items-center gap-2 flex-1",
                isDesktop ? "hidden" : "flex",
              )}
            >
              {logoUrl ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <Store className="w-5 h-5 text-orange-500 shrink-0" />
              )}
              <span className="font-bold truncate">{storeName}</span>
            </div>
          </header>

          {/* MAIN */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
