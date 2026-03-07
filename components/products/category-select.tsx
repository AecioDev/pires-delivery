"use client";

import { useState } from "react";
import { createCategory } from "@/actions/categories";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Category = { id: string; name: string };

interface CategorySelectProps {
  name: string;
  defaultValue?: string | null;
  categories: Category[];
}

/**
 * CategorySelect — select controlado com estado inicializado pelo defaultValue.
 * Usa <select> nativo para serialização natural no FormData de Server Actions.
 * Categorias são passadas como props (buscadas no servidor) — sem fetch async.
 */
export function CategorySelect({
  name,
  defaultValue,
  categories: initialCategories,
}: CategorySelectProps) {
  // Estado controlado — inicializa com o valor existente do produto
  const [value, setValue] = useState<string>(defaultValue ?? "");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [open, setOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newCatName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }
    setCreating(true);
    const fd = new FormData();
    fd.append("name", newCatName);
    const res = await createCategory(fd);
    setCreating(false);

    if (res.success) {
      toast.success("Categoria criada!");
      const capturedName = newCatName.trim();
      setNewCatName("");
      setOpen(false);
      // Adiciona a nova categoria na lista local e já seleciona ela
      const tempId = `temp-${Date.now()}`;
      const newCat = { id: tempId, name: capturedName };
      setCategories((prev) => [...prev, newCat]);
      setValue(tempId);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={name}>Categoria</Label>
      <div className="flex gap-2 items-center">
        {/*
          Select controlado:
          - value={value}: mostra o valor correto na tela sempre
          - onChange: atualiza o estado quando o usuário muda
          - name={name}: o form serializa automaticamente pelo DOM nativo
        */}
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              title="Criar Categoria"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para agrupar seus produtos.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 py-4">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="catName" className="sr-only">
                  Nome
                </Label>
                <Input
                  id="catName"
                  placeholder="Ex: Bebidas, Sobremesas..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                />
              </div>
              <Button type="button" onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
