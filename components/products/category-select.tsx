"use client";

import { useState, useEffect } from "react";
import { getCategories, createCategory } from "@/actions/categories";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function CategorySelect({
  defaultValue,
  name,
}: {
  defaultValue?: string;
  name: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);
  const [value, setValue] = useState<string>("");

  const fetchCategories = async (): Promise<Category[]> => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Carrega categorias e, após o carregamento, define o valor selecionado
  useEffect(() => {
    fetchCategories().then((data) => {
      if (defaultValue && data.some((c) => c.id === defaultValue)) {
        setValue(defaultValue);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza caso o defaultValue mude (ex: ao abrir o dialog de edição de um produto diferente)
  useEffect(() => {
    if (!loading && categories.length > 0) {
      if (defaultValue && categories.some((c) => c.id === defaultValue)) {
        setValue(defaultValue);
      } else {
        setValue("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

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
      const capturedName = newCatName;
      setNewCatName("");
      setOpen(false);
      const data = await fetchCategories();
      const newCat = data.find((c) => c.name === capturedName);
      if (newCat) {
        setValue(newCat.id);
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor={name}>Categoria</Label>
      <div className="flex gap-2 items-center">
        <Select
          name={name}
          value={value}
          onValueChange={setValue}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                loading ? "Carregando..." : "Selecione uma categoria"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
            {!loading && categories.length === 0 && (
              <SelectItem value="__empty__" disabled>
                Nenhuma categoria
              </SelectItem>
            )}
          </SelectContent>
        </Select>

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
