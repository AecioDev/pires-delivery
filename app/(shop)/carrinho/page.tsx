"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
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

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const total = getCartTotal();
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

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
      toast("Item removido", {
        description: "O item foi removido da sua sacola.",
        action: {
          label: "Desfazer",
          onClick: () => console.log("Undo not implemented yet for simplicity"), // Optional
        },
      });
      setItemToRemove(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🛍️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sua sacola está vazia
        </h2>
        <p className="text-gray-500 mb-8 max-w-[250px]">
          Parece que você ainda não escolheu seus pratos favoritos.
        </p>
        <Link href="/">
          <Button
            size="lg"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl h-12 px-8"
          >
            Ver Cardápio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="-ml-2"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" />
        </Button>
        <h1 className="font-bold text-lg text-gray-900">Minha Sacola</h1>
      </div>

      {/* Items List */}
      <div className="p-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-3 shadow-sm flex gap-3"
          >
            {/* Image */}
            <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
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
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 leading-tight mb-1">
                  {item.product.name}
                </h3>
                {Object.keys(item.selections).length > 0 ? (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                    {item.product.modifiers
                      ?.flatMap((mod) => {
                        const selectedIds = item.selections[mod.id];
                        if (!selectedIds?.length) return [];
                        return selectedIds
                          .map(
                            (id) => mod.options.find((o) => o.id === id)?.name,
                          )
                          .filter(Boolean);
                      })
                      .join(", ")}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {item.product.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-orange-600">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.unitPrice)}
                </span>

                {/* Qty Control */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-2">
                  <button
                    onClick={() => handleDecrease(item.id, item.quantity)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md shadow-sm active:scale-95 transition-transform ${item.quantity === 1 ? "bg-red-100 text-red-600" : "bg-white text-gray-700"}`}
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                  </button>
                  <span className="text-sm font-bold w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-700 active:scale-95 transition-transform"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Summary - Static */}
      <div className="bg-white border-t rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] mt-4">
        <div className="w-full max-w-[600px] mx-auto p-6 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(total)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Taxa de entrega</span>
              <span className="text-green-600 font-medium">Grátis</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3 mt-2">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(total)}
              </span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => router.push("/checkout")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 text-base rounded-xl shadow-lg shadow-green-100"
          >
            Continuar para Entrega
          </Button>
        </div>
      </div>

      <Dialog
        open={!!itemToRemove}
        onOpenChange={(open) => !open && setItemToRemove(null)}
      >
        <DialogContent className="max-w-[90%] rounded-2xl w-[90%]">
          <DialogHeader>
            <DialogTitle>Remover item?</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este item da sua sacola?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setItemToRemove(null)}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700"
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
