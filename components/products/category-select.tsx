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

export function CategorySelect({
  defaultValue,
  name,
}: {
  defaultValue?: string;
  name: string;
}) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creating, setCreating] = useState(false);
  const [value, setValue] = useState(defaultValue || "empty");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
      setNewCatName("");
      setOpen(false);
      await fetchCategories(); // refresh list
      // Auto-select the newly created category (assuming the backend returns the id, or we just select it if we can find it)
      // Since our action returns { success: true }, we need to rely on the fetched data to find the newest.
      // Easiest is to select the new one by name from the newly fetched list:
      const data = await getCategories();
      const newCat = data.find((c) => c.name === newCatName);
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
          key={loading ? "loading" : "loaded"}
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
            {categories.length === 0 && (
              <SelectItem value="empty" disabled>
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
