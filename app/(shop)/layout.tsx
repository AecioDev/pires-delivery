import { BottomNav } from "@/components/shop/bottom-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casa Pires Delivery - Cardápio Digital",
  description:
    "Peça seus salgados favoritos e marmitex na Casa Pires Delivery.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-neutral-100 dark:bg-neutral-900 flex justify-center overflow-hidden">
      <div className="w-full max-w-[600px] h-full bg-gray-50 dark:bg-neutral-950 flex flex-col relative shadow-2xl">
        <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
