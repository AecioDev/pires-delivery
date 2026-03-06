"use client";

import { useState, useEffect } from "react";
import {
  getNeighborhoods,
  createNeighborhood,
  deleteNeighborhood,
  updateNeighborhood,
} from "@/actions/neighborhoods";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Neighborhood {
  id: string;
  name: string;
  fee: number;
  active: boolean;
}

export function NeighborhoodSettings() {
  const [items, setItems] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  // Create state
  const [newName, setNewName] = useState("");
  const [newFee, setNewFee] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await getNeighborhoods();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newFee) {
      toast.error("Preencha o nome e o valor da taxa.");
      return;
    }

    setCreating(true);
    const feeNumber = parseFloat(newFee.replace(",", "."));

    const res = await createNeighborhood({
      name: newName.trim(),
      fee: feeNumber,
    });

    if (res.success) {
      toast.success("Bairro adicionado!");
      setNewName("");
      setNewFee("");
      loadData();
    } else {
      toast.error(res.message || "Erro ao adicionar bairro.");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este bairro?")) return;

    const res = await deleteNeighborhood(id);
    if (res.success) {
      toast.success("Bairro removido!");
      setItems(items.filter((i) => i.id !== id));
    } else {
      toast.error("Erro ao remover.");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const res = await updateNeighborhood(id, { active: !currentStatus });
    if (res.success) {
      setItems(
        items.map((i) => (i.id === id ? { ...i, active: !currentStatus } : i)),
      );
    }
  };

  const startEdit = (item: Neighborhood) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditFee(item.fee.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditFee("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim() || !editFee) return;

    const feeNumber = parseFloat(editFee.replace(",", "."));
    const res = await updateNeighborhood(id, {
      name: editName.trim(),
      fee: feeNumber,
    });

    if (res.success) {
      toast.success("Bairro atualizado!");
      setItems(
        items.map((i) =>
          i.id === id ? { ...i, name: editName.trim(), fee: feeNumber } : i,
        ),
      );
      setEditingId(null);
    } else {
      toast.error("Erro ao atualizar bairro.");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Map className="w-5 h-5 text-gray-500" />
          Taxas por Bairro (Tabela de Frete)
        </CardTitle>
        <CardDescription>
          Cadastre os bairros atendidos e seus respectivos valores de entrega.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ADD NEW */}
        <div className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-slate-500">
              Nome do Bairro
            </label>
            <Input
              placeholder="Ex: Centro"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="w-32 space-y-1">
            <label className="text-xs font-medium text-slate-500">
              Taxa (R$)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.5"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              className="bg-white"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="bg-slate-900"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-center text-slate-500 py-4">
              Carregando bairros...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-center text-slate-500 py-4 border border-dashed rounded-lg bg-slate-50">
              Nenhum bairro cadastrado.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:border-orange-200 transition-colors bg-white"
              >
                {editingId === item.id ? (
                  <div className="flex flex-1 gap-2 items-center mr-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      step="0.5"
                      value={editFee}
                      onChange={(e) => setEditFee(e.target.value)}
                      className="h-8 w-24"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <p
                      className={`font-medium ${item.active ? "text-slate-800" : "text-slate-400 line-through"}`}
                    >
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.fee)}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {editingId === item.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveEdit(item.id)}
                        className="h-8 w-8 text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEdit}
                        className="h-8 w-8 text-slate-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Switch
                        checked={item.active}
                        onCheckedChange={() =>
                          handleToggleActive(item.id, item.active)
                        }
                        title={item.active ? "Desativar" : "Ativar"}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(item)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 ml-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
