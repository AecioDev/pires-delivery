"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, Plus, Check } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  SerializedProduct,
  SerializedModifier,
} from "@/lib/store/cart";

// Local interfaces removed in favor of imported ones from store
interface ProductCustomizerProps {
  product: SerializedProduct;
}

export function ProductCustomizer({ product }: ProductCustomizerProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);

  const modifiers = product.modifiers;
  const currentModifier = modifiers[stepIndex];

  // If no modifiers, maybe show a generic "Add to Cart" view or handle gracefuly
  // For now assuming modifiers exist based on context

  const calculateTotal = useMemo(() => {
    let total = Number(product.basePrice);
    Object.values(selections)
      .flat()
      .forEach((optionId) => {
        for (const mod of modifiers) {
          const option = mod.options.find((o) => o.id === optionId);
          if (option) {
            total += Number(option.price);
            break;
          }
        }
      });
    return total * quantity;
  }, [product, selections, quantity, modifiers]);

  const handleOptionToggle = (
    modifier: SerializedModifier,
    optionId: string,
    isRadio: boolean,
  ) => {
    setSelections((prev) => {
      const current = prev[modifier.id] || [];
      if (isRadio) {
        return { ...prev, [modifier.id]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return {
            ...prev,
            [modifier.id]: current.filter((id) => id !== optionId),
          };
        } else {
          if (modifier.maxSelection && current.length >= modifier.maxSelection)
            return prev;
          return { ...prev, [modifier.id]: [...current, optionId] };
        }
      }
    });
  };

  const isStepValid = (index: number) => {
    const modifier = modifiers[index];
    if (!modifier) return true;
    const count = (selections[modifier.id] || []).length;
    return count >= modifier.minSelection;
  };

  const currentStepValid = isStepValid(stepIndex);

  // Check global validity for "Add to Cart"
  const isAllValid = modifiers.every((_, idx) => isStepValid(idx));

  const handleNext = () => {
    if (!currentStepValid) return;

    if (stepIndex < modifiers.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      if (isAllValid) handleAddToCart();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    } else {
      router.back();
    }
  };

  const handleAddToCart = () => {
    if (!isAllValid) return;

    const grandTotal = calculateTotal;
    const unitPrice = grandTotal / quantity;

    addItem({
      product,
      quantity,
      selections,
      unitPrice,
    });

    toast.success("Item adicionado à sacola!");
    router.push("/carrinho");
  };

  if (!currentModifier) {
    return (
      <div>
        Produto sem opções. <Button onClick={handleAddToCart}>Adicionar</Button>
      </div>
    );
  }

  const isRadio = currentModifier.maxSelection === 1;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] bg-gray-50 pb-safe">
      {/* Header Progress */}
      <div className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-2 border-b flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="-ml-2 h-10 w-10 text-gray-500"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="font-bold text-gray-900 truncate flex-1 leading-tight">
            {product.name}
          </h1>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
            {stepIndex + 1} / {modifiers.length}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar border-b bg-gray-50/50">
          {modifiers.map((mod, idx) => {
            const isActive = stepIndex === idx;
            const isValid = isStepValid(idx);
            return (
              <button
                key={mod.id}
                onClick={() => setStepIndex(idx)}
                className={cn(
                  "flex items-center gap-1 whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all border-2",
                  isActive
                    ? "bg-orange-600 border-orange-600 text-white shadow-md"
                    : isValid
                      ? "bg-white border-green-200 text-gray-700"
                      : "bg-white border-transparent text-gray-400 opacity-50",
                )}
              >
                {!!isValid && !isActive && (
                  <Check className="h-3 w-3 text-green-500" />
                )}
                {mod.name}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-3 bg-white">
          <h2 className="text-xl font-bold text-gray-800 leading-tight">
            {currentModifier.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Escolha {currentModifier.minSelection}
            {currentModifier.maxSelection > currentModifier.minSelection
              ? ` a ${currentModifier.maxSelection}`
              : ""}
            opção(ões).
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="p-4 grid grid-cols-2 gap-3 pb-32 overflow-y-auto">
        {currentModifier.options.map((option) => {
          const isSelected = (selections[currentModifier.id] || []).includes(
            option.id,
          );

          return (
            <div
              key={option.id}
              onClick={() =>
                handleOptionToggle(currentModifier, option.id, isRadio)
              }
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm group",
                isSelected
                  ? "border-orange-500 ring-2 ring-orange-500/20"
                  : "border-transparent bg-white",
              )}
            >
              {/* Image Background */}
              <div className="absolute inset-0 bg-gray-200">
                {option.linkedProduct?.imageUrl ? (
                  <Image
                    src={option.linkedProduct.imageUrl}
                    alt={option.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                    <span className="text-3xl opacity-50">🥘</span>
                  </div>
                )}
              </div>

              {/* Overlay Gradient */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white transition-opacity",
                  isSelected
                    ? "opacity-100"
                    : "opacity-90 group-hover:opacity-100",
                )}
              >
                <h3 className="font-bold text-sm leading-tight mb-0.5">
                  {option.name}
                </h3>
                {Number(option.price) > 0 && (
                  <span className="text-xs font-medium text-orange-300">
                    +{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(option.price))}
                  </span>
                )}
              </div>

              {/* Checkbox/Radio Indicator */}
              <div className="absolute top-2 right-2">
                {isSelected && (
                  <div className="bg-orange-500 text-white rounded-full p-1.5 shadow-md">
                    {/* Check Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 flex items-center justify-center safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-[600px] flex items-center justify-between gap-4">
          {/* Total Preview */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">Total</span>
            <span className="font-bold text-xl text-gray-900">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(calculateTotal)}
            </span>
          </div>

          <Button
            className={cn(
              "h-12 px-8 text-base font-bold rounded-xl transition-all",
              currentStepValid
                ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200"
                : "bg-gray-200 text-gray-400 cursor-not-allowed",
            )}
            size="lg"
            onClick={handleNext}
            disabled={!currentStepValid}
          >
            {stepIndex === modifiers.length - 1 ? (
              <div className="flex items-center gap-2">
                <span>Adicionar</span>
                <Plus className="h-5 w-5" />
              </div>
            ) : (
              "Próximo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
