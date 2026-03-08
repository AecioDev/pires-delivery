"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChevronLeft, Check, ShoppingBag, FileText } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCartStore,
  SerializedProduct,
  SerializedModifier,
} from "@/lib/store/cart";

interface ProductCustomizerProps {
  product: SerializedProduct;
}

const BRAND_GRADIENT =
  "linear-gradient(135deg, #8B4513 0%, #C17A3C 50%, #D4A96A 100%)";
// Uso de índice -1 para representar a tela de revisão (após todos os steps)
const IS_REVIEW = (stepIndex: number, total: number) => stepIndex >= total;

export function ProductCustomizer({ product }: ProductCustomizerProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [notes, setNotes] = useState("");

  const modifiers = product.modifiers;
  const currentModifier = modifiers[stepIndex];
  const isReview = IS_REVIEW(stepIndex, modifiers.length);

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

  const currentStepValid = isReview ? true : isStepValid(stepIndex);
  const isAllValid = modifiers.every((_, idx) => isStepValid(idx));

  const handleNext = () => {
    if (!currentStepValid) return;
    // Avança para o próximo step ou para a tela de revisão
    setStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else router.back();
  };

  const handleAddToCart = () => {
    if (!isAllValid) return;
    const unitPrice = calculateTotal / quantity;
    addItem({
      product,
      quantity,
      selections,
      unitPrice,
      notes: notes.trim() || undefined,
    });
    toast.success("Item adicionado à sacola!");
    router.push("/carrinho");
  };

  if (!currentModifier && !isReview) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-muted-foreground">
          Produto sem opções configuradas.
        </p>
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-2 h-12 px-8 rounded-xl text-white font-bold"
          style={{ background: BRAND_GRADIENT }}
        >
          <ShoppingBag className="h-5 w-5" /> Adicionar à Sacola
        </button>
      </div>
    );
  }

  const isRadio = !isReview && currentModifier.maxSelection === 1;
  const isMulti = !isReview && currentModifier.maxSelection > 1;
  const currentSelections = isReview
    ? []
    : selections[currentModifier.id] || [];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-neutral-950">
      {/* ── HEADER ── */}
      <div className="bg-white dark:bg-neutral-900 shadow-sm z-20">
        {/* Top bar */}
        <div className="px-4 py-3 flex items-center gap-3 border-b dark:border-neutral-800">
          <button
            onClick={handleBack}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 truncate leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isReview
                ? "Revisão do pedido"
                : `Passo ${stepIndex + 1} de ${modifiers.length}`}
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5 items-center">
            {modifiers.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === stepIndex
                    ? "w-5"
                    : isStepValid(idx)
                      ? "w-2 bg-green-400"
                      : "w-2 bg-gray-200 dark:bg-neutral-700",
                )}
                style={
                  idx === stepIndex
                    ? { background: BRAND_GRADIENT, width: "20px" }
                    : undefined
                }
              />
            ))}
            {/* Dot da revisão */}
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                isReview ? "w-5" : "w-2 bg-gray-200 dark:bg-neutral-700",
              )}
              style={
                isReview
                  ? { background: BRAND_GRADIENT, width: "20px" }
                  : undefined
              }
            />
          </div>
        </div>

        {/* Step tabs (só aparece nas etapas de opção) */}
        {!isReview && (
          <div className="flex overflow-x-auto gap-2 px-4 py-2.5 scrollbar-hide">
            {modifiers.map((mod, idx) => {
              const isActive = stepIndex === idx;
              const isDone = isStepValid(idx) && idx !== stepIndex;
              return (
                <button
                  key={mod.id}
                  onClick={() => setStepIndex(idx)}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                    isActive
                      ? "text-white border-transparent shadow-sm"
                      : isDone
                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-neutral-800 border-transparent text-gray-500 dark:text-gray-400",
                  )}
                  style={isActive ? { background: BRAND_GRADIENT } : undefined}
                >
                  {isDone && <Check className="h-3 w-3" />}
                  {mod.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Step title */}
        <div
          className="px-4 py-3 border-t dark:border-neutral-800"
          style={{
            background: "linear-gradient(to right, #8B451308, transparent)",
          }}
        >
          {isReview ? (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-700" />
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Confirme seu pedido
              </h2>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {currentModifier.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isMulti
                  ? `Escolha até ${currentModifier.maxSelection} opção(ões)${currentModifier.minSelection > 0 ? ` · ${currentSelections.length}/${currentModifier.maxSelection} selecionado(s)` : ""}`
                  : currentModifier.minSelection > 0
                    ? "Obrigatório · escolha 1 opção"
                    : "Opcional · escolha 1 opção"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-32">
        {/* TELA DE REVISÃO */}
        {isReview ? (
          <div className="space-y-4">
            {/* Resumo por etapa */}
            {modifiers.map((mod) => {
              const selectedIds = selections[mod.id] || [];
              const selectedOptions = mod.options.filter((o) =>
                selectedIds.includes(o.id),
              );
              return (
                <div
                  key={mod.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden"
                >
                  <div className="px-4 py-2.5 border-b dark:border-neutral-800 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {mod.name}
                    </p>
                    <button
                      onClick={() => setStepIndex(modifiers.indexOf(mod))}
                      className="text-xs font-medium text-amber-700 hover:text-amber-900"
                    >
                      Alterar
                    </button>
                  </div>
                  <div className="divide-y dark:divide-neutral-800">
                    {selectedOptions.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-muted-foreground italic">
                        Nenhum selecionado
                      </p>
                    ) : (
                      selectedOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-3 px-4 py-2.5"
                        >
                          {opt.linkedProduct?.imageUrl ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={opt.linkedProduct.imageUrl}
                                alt={opt.name}
                                width={36}
                                height={36}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                              <span className="text-sm">🥘</span>
                            </div>
                          )}
                          <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {opt.name}
                          </span>
                          {Number(opt.price) > 0 && (
                            <span className="text-xs font-semibold text-amber-700">
                              +
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(opt.price))}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            {/* Observações */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
              <div className="px-4 py-2.5 border-b dark:border-neutral-800">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Observações
                </p>
              </div>
              <div className="p-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Sem cebola, molho à parte, alergia a amendoim..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all placeholder:text-muted-foreground text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-muted-foreground mt-1.5 px-1">
                  Opcional · observações adicionais para o preparo do prato.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* LISTA DE OPÇÕES */
          <div className="space-y-2">
            {currentModifier.options.map((option) => {
              const isSelected = currentSelections.includes(option.id);
              const hasImage = !!option.linkedProduct?.imageUrl;

              return (
                <div
                  key={option.id}
                  onClick={() =>
                    handleOptionToggle(currentModifier, option.id, isRadio)
                  }
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer bg-white dark:bg-neutral-900",
                    isSelected
                      ? "shadow-md"
                      : "border-gray-100 dark:border-neutral-800 hover:border-gray-200 dark:hover:border-neutral-700",
                  )}
                  style={isSelected ? { borderColor: "#C17A3C" } : undefined}
                >
                  {/* Image or Emoji */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                    {hasImage ? (
                      <Image
                        src={option.linkedProduct!.imageUrl!}
                        alt={option.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-2xl">🥘</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {option.name}
                    </p>
                    {Number(option.price) > 0 ? (
                      <p
                        className="text-sm font-medium mt-0.5"
                        style={{ color: "#C17A3C" }}
                      >
                        +{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(option.price))}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Incluído
                      </p>
                    )}
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                      isSelected
                        ? "border-transparent text-white"
                        : "border-gray-300 dark:border-neutral-600",
                    )}
                    style={
                      isSelected ? { background: BRAND_GRADIENT } : undefined
                    }
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t dark:border-neutral-800 px-4 py-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-[600px] mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
              Total
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(calculateTotal)}
            </p>
          </div>

          <button
            onClick={isReview ? handleAddToCart : handleNext}
            disabled={!currentStepValid}
            className={cn(
              "h-12 px-8 rounded-xl text-base font-bold text-white transition-all flex items-center gap-2",
              !currentStepValid && "opacity-40 cursor-not-allowed",
            )}
            style={
              currentStepValid
                ? { background: BRAND_GRADIENT }
                : { background: "#9ca3af" }
            }
          >
            {isReview ? (
              <>
                <ShoppingBag className="h-5 w-5" /> Adicionar à Sacola
              </>
            ) : (
              "Próximo →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
