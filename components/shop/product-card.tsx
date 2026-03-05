"use client";

import { Card } from "@/components/ui/card";
import {
  useCartStore,
  SerializedProduct,
  SerializedModifier,
} from "@/lib/store/cart";
import { toast } from "sonner";
import { Plus, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Define a minimal type matching what we get from Server or use explicit type
interface ProductData {
  id: string;
  name: string;
  description: string | null;
  basePrice: number | object;
  promotionalPrice?: number | null;
  serves?: number | null;
  imageUrl: string | null;
  type?: string;
  modifiers?: SerializedModifier[];
}

export function ProductCard({ product }: { product: ProductData }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [open, setOpen] = useState(false);

  // Normalize base price
  const basePriceNum =
    typeof product.basePrice === "object" &&
    product.basePrice !== null &&
    "toNumber" in product.basePrice
      ? Number(product.basePrice)
      : Number(product.basePrice);

  // Determine effective price
  const promoPriceNum = product.promotionalPrice
    ? Number(product.promotionalPrice)
    : null;
  const isPromo = promoPriceNum !== null && promoPriceNum < basePriceNum;
  const finalPrice = isPromo && promoPriceNum ? promoPriceNum : basePriceNum;

  const isComposite =
    product.type === "COMPOSITE" ||
    (product.modifiers && product.modifiers.length > 0);

  const handleQuickAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isComposite) {
      router.push(`/produto/${product.id}`);
      return;
    }

    const cartItem: SerializedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: finalPrice,
      imageUrl: product.imageUrl,
      modifiers: (product.modifiers || []) as SerializedModifier[],
      type: product.type || "ITEM",
    };

    addItem({
      product: cartItem,
      quantity: 1,
      selections: {},
      unitPrice: finalPrice,
    });

    toast.success("Adicionado à sacola!");
    setOpen(false);
  };

  const handleCardClick = () => {
    if (isComposite) {
      router.push(`/produto/${product.id}`);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="flex flex-row overflow-hidden border border-gray-100 shadow-sm rounded-lg bg-white p-3 gap-3 transition-colors hover:border-orange-200 relative cursor-pointer group"
      >
        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed mb-2">
              {product.description || "Delicioso e feito na hora."}
            </p>

            {/* Serves info */}
            {product.serves && product.serves > 1 && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 mb-1 w-fit px-1.5 py-0.5 rounded">
                <Users className="w-3 h-3" />
                <span>Serve até {product.serves} pessoas</span>
              </div>
            )}
          </div>

          <div className="font-medium text-gray-900 flex items-center gap-2">
            {isComposite ? "A partir de " : ""}

            {isPromo && (
              <span className="text-xs text-gray-400 line-through">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(basePriceNum)}
              </span>
            )}

            <span className={isPromo ? "text-red-500 font-bold" : ""}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(finalPrice)}
            </span>
          </div>
        </div>

        {/* Image */}
        <div className="w-28 h-24 bg-gray-100 rounded-md relative overflow-hidden flex-none">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100px, 100px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
              <Search className="w-6 h-6 opacity-20" />
            </div>
          )}

          {/* Badge for Composite */}
          {isComposite ? (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[2px] text-white text-[10px] font-bold text-center py-0.5">
              Montar
            </div>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-1 right-1 bg-white text-orange-600 rounded-full p-1.5 shadow-md active:scale-95 transition-transform hover:bg-orange-50 z-10"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Details Modal (Only for Simple Products) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 rounded-2xl">
          <div className="relative h-48 bg-gray-100 w-full">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
            {isPromo && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm z-10">
                OFERTA
              </div>
            )}
          </div>
          <div className="p-6 space-y-4">
            <div>
              <DialogTitle className="text-xl font-bold mb-1">
                {product.name}
              </DialogTitle>
              <p className="text-gray-500 text-sm leading-relaxed">
                {product.description || "Sem descrição."}
              </p>
            </div>

            {product.serves && product.serves > 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Serve até {product.serves} pessoas</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex flex-col">
                {isPromo && (
                  <span className="text-xs text-gray-400 line-through">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(basePriceNum)}
                  </span>
                )}
                <span
                  className={`text-xl font-bold ${isPromo ? "text-red-600" : "text-gray-900"}`}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(finalPrice)}
                </span>
              </div>
              <Button
                onClick={() => handleQuickAdd()}
                className="rounded-full px-6 font-semibold bg-orange-600 hover:bg-orange-700"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
