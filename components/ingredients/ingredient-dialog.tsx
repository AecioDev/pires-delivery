
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createIngredient, updateIngredient } from "@/actions/ingredients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

// Define a simplified Ingredient type
type Ingredient = {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number | object | null; // Prisma Decimal quirks
  minStockLevel: number | object | null;
};

interface IngredientDialogProps {
  ingredient?: Ingredient;
}

export function IngredientDialog({ ingredient }: IngredientDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!ingredient;

  async function handleSubmit(formData: FormData) {
    let result;
    
    if (isEdit && ingredient) {
        result = await updateIngredient(ingredient.id, formData);
    } else {
        result = await createIngredient(formData);
    }

    if (result?.success) {
      toast.success(isEdit ? "Insumo atualizado!" : "Insumo criado!");
      setOpen(false);
    } else {
      toast.error("Erro ao salvar insumo.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="icon" variant="ghost" className="hover:bg-slate-100">
            <Pencil className="h-4 w-4 text-blue-500" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Insumo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Insumo" : "Adicionar Insumo"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Edite as informações do insumo." : "Cadastre um novo ingrediente para usar nas fichas técnicas."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Nome do Insumo</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={ingredient?.name} 
                placeholder="Ex: Farinha de Trigo" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="unit">Unidade de Medida</Label>
                <Select name="unit" defaultValue={ingredient?.unit || "kg"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Quilograma (KG)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="l">Litro (L)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="price">Preço por Unidade (R$)</Label>
                <Input 
                    id="price" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    defaultValue={ingredient?.pricePerUnit ? Number(ingredient.pricePerUnit) : ""}
                    placeholder="0.00" 
                    required 
                />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="minStock">Estoque Mínimo (Opcional)</Label>
                <Input 
                    id="minStock" 
                    name="minStock" 
                    type="number" 
                    step="0.001" 
                    defaultValue={ingredient?.minStockLevel ? Number(ingredient.minStockLevel) : ""}
                    placeholder="0" 
                />
              </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
            </Button>
            <SubmitButton isEdit={isEdit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Insumo"}
    </Button>
  );
}
