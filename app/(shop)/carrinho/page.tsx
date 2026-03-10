"use client";

import { useCartStore } from "@/lib/store/cart";
import {
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  FileText,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CartItem } from "@/lib/store/cart";

const BRAND_GRADIENT =
  "linear-gradient(135deg, #8B4513 0%, #C17A3C 50%, #D4A96A 100%)";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const total = getCartTotal();
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<CartItem | null>(null);

  const handleDecrease = (id: string, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(id, -1);
    } else {
      setItemToRemove(id);
    }
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeItem(itemToRemove);
      toast("Item removido da sacola.");
      setItemToRemove(null);
    }
  };

  /* ─── Empty State ─── */
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-gray-50 dark:bg-neutral-950">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "linear-gradient(135deg, #8B451320, #D4A96A30)",
          }}
        >
          <ShoppingBag className="w-10 h-10 text-amber-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Sua sacola está vazia
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[260px] text-sm">
          Que tal escolher um prato delicioso do nosso cardápio?
        </p>
        <Link href="/">
          <button
            className="h-12 px-8 rounded-xl text-base font-bold text-white shadow-lg"
            style={{ background: BRAND_GRADIENT }}
          >
            Ver Cardápio
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-neutral-950 min-h-full pb-8">
      {/* ── Header ── */}
      <div className="bg-white dark:bg-neutral-900 px-4 py-3 sticky top-0 z-20 shadow-sm border-b dark:border-neutral-800 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors -ml-1"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">
          Minha Sacola
        </h1>
        <span className="ml-auto text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>

      {/* ── Items ── */}
      <div className="p-4 space-y-3">
        {items.map((item) => {
          const selectionNames =
            item.product.modifiers?.flatMap((mod) => {
              const ids = item.selections[mod.id];
              if (!ids?.length) return [];
              return ids
                .map((id) => mod.options.find((o) => o.id === id)?.name)
                .filter(Boolean);
            }) ?? [];

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-neutral-800"
            >
              <div className="flex gap-3">
                {/* Image */}
                <div className="relative w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-xl overflow-hidden shrink-0">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-2xl">
                      🥘
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {selectionNames.length > 0
                        ? selectionNames.join(", ")
                        : item.product.description}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 italic line-clamp-1">
                        Obs: {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Price row */}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="font-bold text-base"
                      style={{ color: "#C17A3C" }}
                    >
                      {fmt(item.unitPrice * item.quantity)}
                    </span>

                    {/* Qty Control */}
                    <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5 gap-1">
                      <button
                        onClick={() => handleDecrease(item.id, item.quantity)}
                        className={`w-7 h-7 flex items-center justify-center rounded-md shadow-sm active:scale-95 transition-transform ${item.quantity === 1 ? "bg-red-100 dark:bg-red-950 text-red-600" : "bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200"}`}
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </button>
                      <span className="text-sm font-bold w-5 text-center text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-md shadow-sm text-gray-700 dark:text-gray-200 active:scale-95 transition-transform"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ver Detalhes — apenas para produtos montáveis */}
              {item.product.type === "COMPOSITE" &&
                selectionNames.length > 0 && (
                  <button
                    onClick={() => setDetailItem(item)}
                    className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-500 hover:text-amber-900 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Ver detalhes do item
                  </button>
                )}
            </div>
          );
        })}
      </div>

      {/* ── Footer Summary ── */}
      <div className="bg-white dark:bg-neutral-900 border-t dark:border-neutral-800 rounded-t-3xl shadow-[0_-4px_12px_rgba(0,0,0,0.07)] mt-2">
        <div className="w-full max-w-[600px] mx-auto p-5 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Taxa de entrega</span>
              <span className="text-green-600 font-medium">Grátis</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 border-t dark:border-neutral-800 pt-3 mt-1">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="w-full h-14 rounded-xl text-base font-bold text-white shadow-lg"
            style={{ background: BRAND_GRADIENT }}
          >
            Continuar para Entrega →
          </button>
        </div>
      </div>

      {/* ── Dialog: Confirmar Remoção ── */}
      <Dialog
        open={!!itemToRemove}
        onOpenChange={(o) => !o && setItemToRemove(null)}
      >
        <DialogContent className="max-w-[90%] rounded-2xl w-[90%]">
          <DialogHeader>
            <DialogTitle>Remover item?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este item da sua sacola?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <button
              onClick={() => setItemToRemove(null)}
              className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-neutral-700 font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={confirmRemove}
              className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
            >
              Remover
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sheet: Ver Detalhes ── */}
      <Sheet
        open={!!detailItem}
        onOpenChange={(o) => !o && setDetailItem(null)}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-700" />
              {detailItem?.product.name}
            </SheetTitle>
          </SheetHeader>

          {detailItem && (
            <div className="space-y-3">
              {/* Seleções por etapa */}
              {detailItem.product.modifiers?.map((mod) => {
                const selectedIds = detailItem.selections[mod.id] || [];
                const selectedOpts = mod.options.filter((o) =>
                  selectedIds.includes(o.id),
                );
                if (selectedOpts.length === 0) return null;
                return (
                  <div
                    key={mod.id}
                    className="bg-gray-50 dark:bg-neutral-800 rounded-xl overflow-hidden"
                  >
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2 border-b dark:border-neutral-700">
                      {mod.name}
                    </p>
                    <div className="divide-y dark:divide-neutral-700">
                      {selectedOpts.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between px-3 py-2"
                        >
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {opt.name}
                          </span>
                          {Number(opt.price) > 0 && (
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#C17A3C" }}
                            >
                              + {fmt(Number(opt.price))}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Observações */}
              {detailItem.notes && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-1">
                    Observações
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {detailItem.notes}
                  </p>
                </div>
              )}

              {/* Total do item */}
              <div className="flex items-center justify-between pt-2 border-t dark:border-neutral-800">
                <span className="text-sm text-muted-foreground">
                  Total do item
                </span>
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {fmt(detailItem.unitPrice * detailItem.quantity)}
                </span>
              </div>

              {/* Botão fechar */}
              <button
                onClick={() => setDetailItem(null)}
                className="w-full h-12 rounded-xl text-white font-bold mt-2"
                style={{ background: BRAND_GRADIENT }}
              >
                Fechar
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
