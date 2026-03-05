"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export const MobileSidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setOpen(false), 0);
    }
  }, [pathname, open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="p-0 bg-slate-900 border-none w-72 text-white"
      >
        <SheetTitle className="hidden">Menu de Navegação</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
