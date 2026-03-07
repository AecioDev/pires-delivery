"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createProduct, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ImageIcon, DollarSign, Package, Settings } from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import Link from "next/link";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CategorySelect } from "./category-select";

type Product = {
  id: string;
  name: string;
  categoryId?: string | null;
  shortName?: string | null;
  description: string | null;
  basePrice: number | null;
  promotionalPrice?: number | null;
  stock?: number | null;
  costPrice?: number | null;
  minStockLevel?: number | null;
  unit?: string | null;
  serves?: number | null;
  type: "ITEM" | "COMPOSITE" | "COMPONENT";
  status?: "ACTIVE" | "INACTIVE" | "UNAVAILABLE";
  imageUrl: string | null;
};

type Category = { id: string; name: string };

interface ProductFormProps {
  product?: Product;
  defaultType?: "ITEM" | "COMPOSITE" | "COMPONENT";
  categories: Category[];
  onSuccess?: () => void;
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-border mb-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function ProductForm({
  product,
  defaultType,
  categories,
  onSuccess,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.imageUrl || null,
  );
  const [productType, setProductType] = useState<string>(
    product?.type || defaultType || "ITEM",
  );
  const [productStatus, setProductStatus] = useState<string>(
    product?.status || "ACTIVE",
  );
  const [basePrice, setBasePrice] = useState<number>(
    product?.basePrice ? Number(product.basePrice) : 0,
  );
  const [promotionalPrice, setPromotionalPrice] = useState<number>(
    product?.promotionalPrice ? Number(product.promotionalPrice) : 0,
  );
  const [costPrice, setCostPrice] = useState<number>(
    product?.costPrice ? Number(product.costPrice) : 0,
  );

  const isEdit = !!product;

  async function handleSubmit(formData: FormData) {
    let result;
    if (isEdit && product) {
      result = await updateProduct(product.id, formData);
    } else {
      result = await createProduct(formData);
    }

    if (result?.success) {
      toast.success(isEdit ? "Produto atualizado!" : "Produto criado!");
      if (onSuccess) onSuccess();
      if (!isEdit) {
        setImageUrl(null);
        setProductType("ITEM");
      }
    } else {
      toast.error("Erro ao salvar produto.");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* ── Imagem ── */}
      <div>
        <SectionTitle icon={ImageIcon} label="Imagem do Produto" />
        <div className="flex items-center gap-6">
          {imageUrl ? (
            <div className="relative w-28 h-28 rounded-xl overflow-hidden border dark:border-neutral-700 shrink-0 shadow-sm">
              <Image
                src={imageUrl}
                alt="Preview"
                fill
                className="object-cover"
                sizes="112px"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 z-10 opacity-80 hover:opacity-100"
                onClick={() => setImageUrl(null)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-28 h-28 rounded-xl border-2 border-dashed border-border dark:border-neutral-700 flex items-center justify-center text-muted-foreground shrink-0">
              <ImageIcon className="h-8 w-8 opacity-30" />
            </div>
          )}
          <div className="flex-1">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setImageUrl(res[0].url);
                  toast.success("Imagem enviada!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Erro: ${error.message}`);
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG ou WEBP • Max 4MB
            </p>
          </div>
        </div>
        <input type="hidden" name="imageUrl" value={imageUrl || ""} />
      </div>

      {/* ── Informações ── */}
      <div>
        <SectionTitle icon={Package} label="Informações" />
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name}
              placeholder="Ex: Coca Cola Lata"
              required
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              defaultValue={product?.description || ""}
              placeholder="Descreva o produto"
            />
          </div>
          <CategorySelect
            name="categoryId"
            defaultValue={product?.categoryId}
            categories={categories}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="serves">Serve (Pessoas)</Label>
              <Input
                id="serves"
                name="serves"
                type="number"
                defaultValue={product?.serves ? Number(product.serves) : "1"}
                placeholder="1"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="stock">Estoque Atual</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                step="any"
                defaultValue={product?.stock ? Number(product.stock) : "0"}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Preços ── */}
      <div>
        <SectionTitle icon={DollarSign} label="Preços" />
        <div className="grid grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label>Preço de Venda (R$)</Label>
            <CurrencyInput value={basePrice} onChange={setBasePrice} />
            <input type="hidden" name="basePrice" value={basePrice} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label>Preço Promocional (R$)</Label>
            <CurrencyInput
              value={promotionalPrice}
              onChange={setPromotionalPrice}
            />
            <input
              type="hidden"
              name="promotionalPrice"
              value={promotionalPrice}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 rounded-lg bg-muted/40 border border-border dark:border-neutral-800">
          <p className="col-span-3 text-xs font-medium text-muted-foreground mb-1">
            Dados internos (não aparecem no cardápio)
          </p>
          <div className="grid w-full items-center gap-1.5">
            <Label>Custo (R$)</Label>
            <CurrencyInput value={costPrice} onChange={setCostPrice} />
            <input type="hidden" name="costPrice" value={costPrice} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="minStockLevel">Est. Mínimo</Label>
            <Input
              id="minStockLevel"
              name="minStockLevel"
              type="number"
              step="any"
              defaultValue={
                product?.minStockLevel ? Number(product.minStockLevel) : "0"
              }
              placeholder="0"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="unit">Unidade</Label>
            <Select name="unit" defaultValue={product?.unit || "un"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="un">Unidade (un)</SelectItem>
                <SelectItem value="kg">Quilo (kg)</SelectItem>
                <SelectItem value="g">Grama (g)</SelectItem>
                <SelectItem value="l">Litro (l)</SelectItem>
                <SelectItem value="ml">Mililitro (ml)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Configurações ── */}
      <div>
        <SectionTitle icon={Settings} label="Configurações" />
        <div className="grid grid-cols-2 gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label>Tipo de Produto</Label>
            <Select
              name="type"
              value={productType}
              onValueChange={setProductType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ITEM">Produto Padrão</SelectItem>
                <SelectItem value="COMPOSITE">
                  Montável (ex: Macarrão)
                </SelectItem>
                <SelectItem value="COMPONENT">Insumo / Adicional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label>Status na Loja</Label>
            <Select
              name="status"
              value={productStatus}
              onValueChange={setProductStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">
                  <span className="flex items-center gap-2">
                    <Badge className="h-2 w-2 p-0 bg-green-500 rounded-full" />
                    Ativo — Visível no cardápio
                  </span>
                </SelectItem>
                <SelectItem value="UNAVAILABLE">
                  <span className="flex items-center gap-2">
                    <Badge className="h-2 w-2 p-0 bg-orange-500 rounded-full" />
                    Esgotado — Visível, indisponível
                  </span>
                </SelectItem>
                <SelectItem value="INACTIVE">
                  <span className="flex items-center gap-2">
                    <Badge className="h-2 w-2 p-0 bg-gray-400 rounded-full" />
                    Inativo — Oculto da loja
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Ações ── */}
      <div className="flex justify-end pt-2 gap-2 border-t border-border">
        <Link href="/produtos">
          <Button type="button" variant="outline">
            Voltar
          </Button>
        </Link>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Produto"}
    </Button>
  );
}
