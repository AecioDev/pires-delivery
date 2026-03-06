"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { ProductForm } from "./product-form";

// Define a simplified Product type based on what we use
type Product = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number | null;
  type: "ITEM" | "COMPOSITE" | "COMPONENT";
  imageUrl: string | null;
};

interface ProductDialogProps {
  product?: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultType?: "ITEM" | "COMPOSITE" | "COMPONENT";
}

export function ProductDialog({
  product,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultType,
}: ProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!product;

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  function handleOpenChange(val: boolean) {
    if (setOpen) setOpen(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {isEdit ? (
            <Button size="icon" variant="ghost" className="hover:bg-slate-100">
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
          ) : (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Produto
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Produto" : "Adicionar Produto"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edite as informações do produto."
              : "Cadastre um item no menu."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ProductForm
            product={product}
            defaultType={defaultType}
            onSuccess={() => handleOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
