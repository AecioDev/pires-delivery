"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createProduct, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import Link from "next/link";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CategorySelect } from "./category-select";

// Reusing the type definition
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

interface ProductFormProps {
  product?: Product;
  defaultType?: "ITEM" | "COMPOSITE" | "COMPONENT";
  onSuccess?: () => void;
}

export function ProductForm({
  product,
  defaultType,
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

  // State for Currency Inputs
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

    // The hidden input inside the form handles imageUrl.

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
    <form action={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-lg bg-slate-50">
        {imageUrl ? (
          <div className="relative w-32 h-32 rounded-md overflow-hidden border">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 z-10"
              onClick={() => setImageUrl(null)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
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
            <p className="text-xs text-muted-foreground mt-2">Max 4MB</p>
          </div>
        )}
        <input type="hidden" name="imageUrl" value={imageUrl || ""} />
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Nome do Produto</Label>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name}
          placeholder="Ex: Macarrão ao Vivo"
          required
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          defaultValue={product?.description || ""}
          placeholder="Ex: Monte sua massa favorita na hora"
        />
      </div>
      <CategorySelect
        name="categoryId"
        defaultValue={product?.categoryId || undefined}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="basePrice">Preço Venda (R$)</Label>
          <CurrencyInput value={basePrice} onChange={setBasePrice} />
          <input type="hidden" name="basePrice" value={basePrice} />
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="promotionalPrice">Preço Promo (R$)</Label>
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

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-md border">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="costPrice">Custo (R$)</Label>
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
      <div className="grid grid-cols-2 gap-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="type">Tipo de Produto</Label>
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
              <SelectItem value="COMPOSITE">Montável (ex: Macarrão)</SelectItem>
              <SelectItem value="COMPONENT">Insumo/Adicional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="status">Status na Loja</Label>
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
                Ativo (Visível e Selecionável)
              </SelectItem>
              <SelectItem value="UNAVAILABLE">
                Inativo no Cardápio (Visível, Esgotado)
              </SelectItem>
              <SelectItem value="INACTIVE">Inativo (Oculto da Loja)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-2">
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
