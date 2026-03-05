"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createModifier,
  deleteModifier,
  updateModifier,
  createModifierOption,
  deleteModifierOption,
  updateModifierOption,
} from "@/actions/modifiers";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductDialog } from "./product-dialog";
import { useRouter } from "next/navigation";

type ModifierOption = {
  id: string;
  name: string;
  price: number;
  linkedProductId?: string | null;
  quantity: number;
};

type Modifier = {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  sequence: number;
  enablePrice: boolean;
  options: ModifierOption[];
};

type LinkableProduct = {
  id: string;
  name: string;
  shortName?: string | null;
  basePrice: number | null;
  type: string;
  unit: string;
};

export function ModifierList({
  productId,
  modifiers,
  linkableProducts,
}: {
  productId: string;
  modifiers: Modifier[];
  linkableProducts: LinkableProduct[];
}) {
  const nextSequence =
    modifiers.length > 0
      ? Math.max(...modifiers.map((m) => m.sequence)) + 1
      : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Etapas de Montagem</h3>
          <p className="text-sm text-muted-foreground">
            Defina o que o cliente escolhe (Massa, Molho, etc) e em qual ordem.
          </p>
        </div>
        <ModifierDialog productId={productId} defaultSequence={nextSequence} />
      </div>

      {modifiers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhuma etapa configurada.
            </p>
            <ModifierDialog
              productId={productId}
              defaultSequence={1}
              trigger={
                <Button variant="secondary">Criar Primeira Etapa</Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modifiers.map((modifier) => (
            <Card key={modifier.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="h-6 w-6 rounded-full flex items-center justify-center p-0"
                    >
                      {modifier.sequence}
                    </Badge>
                    <CardTitle className="text-base">{modifier.name}</CardTitle>
                    {modifier.minSelection > 0 ? (
                      <Badge
                        variant="default"
                        className="text-[10px] px-2 h-5 bg-blue-600 hover:bg-blue-700"
                      >
                        Obrigatório
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 h-5"
                      >
                        Opcional
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">
                      Max: {modifier.maxSelection}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ModifierDialog
                      productId={productId}
                      modifier={modifier}
                      trigger={
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                      }
                    />
                    <form
                      action={async () => {
                        await deleteModifier(productId, modifier.id);
                        toast.success("Etapa removida.");
                      }}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {modifier.options.map((opt) => (
                      <Badge
                        key={opt.id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 flex items-center gap-2"
                      >
                        {opt.name}
                        {Number(opt.price) > 0 && (
                          <span className="text-green-600 font-semibold">
                            +{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(opt.price))}
                          </span>
                        )}

                        <div className="flex items-center gap-1 border-l pl-2 ml-1">
                          <OptionDialog
                            productId={productId}
                            modifierId={modifier.id}
                            enablePrice={modifier.enablePrice}
                            linkableProducts={linkableProducts}
                            option={opt}
                            trigger={
                              <button className="hover:text-blue-500 transition-colors">
                                <Pencil className="h-3 w-3" />
                              </button>
                            }
                          />

                          <form
                            action={async () => {
                              await deleteModifierOption(productId, opt.id);
                              toast.success("Opção removida.");
                            }}
                          >
                            <button
                              type="submit"
                              className="hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </form>
                        </div>
                      </Badge>
                    ))}
                    <OptionDialog
                      productId={productId}
                      modifierId={modifier.id}
                      enablePrice={modifier.enablePrice}
                      linkableProducts={linkableProducts}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ModifierDialog({
  productId,
  modifier,
  defaultSequence,
  trigger,
}: {
  productId: string;
  modifier?: Modifier;
  defaultSequence?: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!modifier;
  const [isRequired, setIsRequired] = useState(
    isEdit ? (modifier?.minSelection ?? 0) > 0 : true,
  );

  async function handleSubmit(formData: FormData) {
    if (isEdit && modifier) {
      await updateModifier(modifier.id, formData);
      toast.success("Etapa atualizada!");
    } else {
      await createModifier(productId, formData);
      toast.success("Etapa criada!");
      // setIsRequired(true); // reset handled by onOpenChange
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) {
          setIsRequired(isEdit ? (modifier?.minSelection ?? 0) > 0 : true);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Passo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Editar Etapa" : "Nova Etapa de Montagem"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Etapa</Label>
              <Input
                name="name"
                defaultValue={modifier?.name}
                placeholder="Ex: Escolha a Massa"
                required
              />
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Switch
                id="required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <div className="flex-1">
                <Label htmlFor="required" className="font-medium">
                  Obrigatório
                </Label>
                <p className="text-xs text-muted-foreground">
                  O cliente deve selecionar pelo menos 1 opção.
                </p>
              </div>
              <input
                type="hidden"
                name="minSelection"
                value={isRequired ? "1" : "0"}
              />
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md bg-slate-50">
              <Switch
                name="enablePrice"
                defaultChecked={modifier?.enablePrice ?? true}
                value="true" // HTML switch logic helper
                onCheckedChange={(c) => {
                  // We need a hidden input for the form data because Switch doesn't submit if inside a format normally unless checked?
                  // Actually shadcn Switch doesn't use name attribute correctly for FormData directly usually,
                  // better to use a hidden input synced with state or just a simple checkbox if lazy.
                  // Let's use a hidden input synced.
                  const input = document.getElementById(
                    "enablePriceInput",
                  ) as HTMLInputElement;
                  if (input) input.value = c ? "true" : "false";
                }}
              />
              {/* Controlled Hidden Input */}
              <input
                type="hidden"
                name="enablePrice"
                id="enablePriceInput"
                defaultValue={
                  modifier?.enablePrice === false ? "false" : "true"
                }
              />

              <div className="flex-1">
                <Label className="font-medium">Cobrar pelos itens?</Label>
                <p className="text-xs text-muted-foreground">
                  Se desativado, todos os itens desta etapa serão{" "}
                  <strong>Grátis</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ordem</Label>
                <Input
                  key={defaultSequence}
                  name="sequence"
                  type="number"
                  defaultValue={modifier?.sequence || defaultSequence}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Máximo de Opções</Label>
                <Input
                  name="maxSelection"
                  type="number"
                  defaultValue={modifier?.maxSelection || 1}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OptionDialog({
  productId,
  modifierId,
  enablePrice,
  linkableProducts,
  option,
  trigger,
}: {
  productId: string;
  modifierId: string;
  enablePrice: boolean;
  linkableProducts: LinkableProduct[];
  option?: ModifierOption;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [unit, setUnit] = useState<string>("un");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);

  // State for creating new product on the fly
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const router = useRouter();
  const isEdit = !!option;

  function resetState() {
    if (option) {
      setName(option.name);
      setPrice(Number(option.price));
      setSelectedProduct(option.linkedProductId || "");
      setQuantity(Number(option.quantity));

      const linked = linkableProducts.find(
        (p) => p.id === option.linkedProductId,
      );
      setUnit(linked?.unit || "un");
    } else {
      setName("");
      setPrice(0);
      setSelectedProduct("");
      setUnit("un");
      setQuantity(1);
    }
  }

  async function handleSubmit(formData: FormData) {
    if (isEdit && option) {
      await updateModifierOption(productId, option.id, formData);
      toast.success("Opção atualizada!");
    } else {
      await createModifierOption(productId, modifierId, formData);
      toast.success("Opção adicionada!");
    }
    setOpen(false);
    resetState();
  }

  function handleProductChange(val: string) {
    setSelectedProduct(val);
    const prod = linkableProducts.find((p) => p.id === val);
    if (prod) {
      // Auto-fill name if empty or creating?
      // User might want to keep custom name. Only overwrite if it was empty?
      // Or always overwrite? User usually selects product first.
      // If editing, maybe not overwrite?
      // Simple logic: If name is empty, fill it.
      if (!name) setName(prod.shortName || prod.name);

      if (enablePrice) {
        setPrice(Number(prod.basePrice || 0));
      }
      setUnit(prod.unit || "un");
    } else {
      setUnit("un");
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (val) resetState();
        }}
      >
        <DialogTrigger asChild>
          {trigger || (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-100 border-dashed"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Opção
            </Badge>
          )}
        </DialogTrigger>
        <DialogContent>
          <form action={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Editar Opção" : "Nova Opção"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Vincular Produto/Insumo (Opcional)</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedProduct}
                    onValueChange={handleProductChange}
                    name="linkedProductId"
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {linkableProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.shortName ? `(${p.shortName})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setIsProductDialogOpen(true)}
                    title="Novo Insumo"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Nome da Opção</Label>
                <Input
                  name="name"
                  id="optionName"
                  placeholder="Ex: Penne"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Quantidade de Baixa (Estoque)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    name="quantity"
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                  <span className="text-sm font-medium w-12 text-center bg-slate-100 py-2 rounded-md">
                    {unit}
                  </span>
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Quanto será descontado do estoque do produto vinculado.
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Preço Adcional (R$)</Label>
                <CurrencyInput
                  value={price}
                  onChange={setPrice}
                  disabled={!enablePrice}
                />
                <input
                  type="hidden"
                  name="price"
                  value={enablePrice ? price : 0}
                />
                {!enablePrice && (
                  <p className="text-xs text-orange-600">
                    Esta etapa é gratuita.
                  </p>
                )}
                {enablePrice && (
                  <p className="text-xs text-muted-foreground">
                    Deixe 0 para ser grátis.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ProductDialog
        open={isProductDialogOpen}
        onOpenChange={(val) => {
          setIsProductDialogOpen(val);
          if (!val) {
            // When closing, refresh to get new products
            router.refresh();
          }
        }}
      />
    </>
  );
}
