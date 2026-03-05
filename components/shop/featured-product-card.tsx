"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  useCartStore,
  SerializedModifier,
  SerializedProduct,
} from "@/lib/store/cart";
import { Plus, Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";

interface FeaturedProductData {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  promotionalPrice?: number | null;
  serves?: number | null;
  isDishOfTheDay?: boolean;
  imageUrl: string | null;
  type?: string;
  modifiers?: SerializedModifier[];
}

export function FeaturedProductCard({
  product,
}: {
  product: FeaturedProductData;
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const price = product.promotionalPrice || product.basePrice;
  const isPromo =
    product.promotionalPrice && product.promotionalPrice < product.basePrice;
  const isComposite =
    product.type === "COMPOSITE" ||
    (product.modifiers && product.modifiers.length > 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isComposite) {
      router.push(`/produto/${product.id}`);
      return;
    }

    const cartProduct: SerializedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl,
      type: product.type || "ITEM",
      modifiers: product.modifiers || [],
    };

    addItem({
      product: cartProduct,
      quantity: 1,
      selections: {},
      unitPrice: price,
    });

    toast.success("Adicionado à sacola!");
  };

  return (
    <div className="flex-none w-[200px] sm:w-[240px]">
      <Link href={`/produto/${product.id}`} className="block group h-full">
        <Card className="overflow-hidden border-0 shadow-md rounded-2xl bg-white h-full relative flex flex-col">
          {/* Image Area */}
          <div className="h-32 sm:h-40 bg-gray-100 relative overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 200px, 240px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Search className="h-8 w-8 opacity-20" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
              {product.isDishOfTheDay && (
                <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" />
                  <span>DIA</span>
                </div>
              )}
              {isPromo && (
                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                  OFERTA
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <CardContent className="p-3 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight mb-auto group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>

            {/* Serves Info */}
            {product.serves && product.serves > 1 && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                <Users className="w-3 h-3" />
                <span>Serve até {product.serves} pessoas</span>
              </div>
            )}

            <div className="mt-auto flex items-end justify-between">
              <div>
                {isPromo && (
                  <span className="block text-xs text-gray-400 line-through">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.basePrice)}
                  </span>
                )}
                <span
                  className={`font-bold ${isPromo ? "text-red-500" : "text-gray-900"}`}
                >
                  {product.type === "COMPOSITE" ? "A partir de " : ""}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(price)}
                </span>
              </div>

              {/* Quick Add Button */}
              {!isComposite ? (
                <button
                  onClick={handleQuickAdd}
                  className="bg-orange-600 text-white rounded-full p-1.5 shadow-md active:scale-95 transition-transform hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Montar
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
