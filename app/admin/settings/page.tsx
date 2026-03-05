"use client";

import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/actions/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Store, Phone, Truck, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsappPhone: "",
    isOpen: true,
    deliveryFee: 0,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        if (data) {
          setFormData({
            name: data.name || "",
            whatsappPhone: data.whatsappPhone || "",
            isOpen: data.isOpen,
            deliveryFee: data.deliveryFee,
          });
        }
      } catch (error) {
        console.error("Settings load error:", error);
        toast.error("Erro ao carregar configurações.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Basic validation
      const sanitizedPhone = formData.whatsappPhone.replace(/\D/g, "");

      const res = await updateSettings({
        name: formData.name,
        whatsappPhone: sanitizedPhone || null,
        isOpen: formData.isOpen,
        deliveryFee: Number(formData.deliveryFee),
      });

      if (res.success) {
        toast.success("Configurações salvas com sucesso!");
        // Update local state with sanitized phone to match DB intention
        setFormData((prev) => ({ ...prev, whatsappPhone: sanitizedPhone }));
      }
    } catch (error) {
      console.error("Settings save error:", error);
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <span className="text-gray-500 animate-pulse">
          Carregando configurações...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Configurações da Loja
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie informações básicas e operação do seu delivery.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status da Loja */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-500" />
              Operação
            </CardTitle>
            <CardDescription>
              Controle o recebimento de novos pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Loja Aberta</Label>
                <p className="text-sm text-gray-500">
                  {formData.isOpen
                    ? "Os clientes podem ver o cardápio e fazer pedidos."
                    : "Pausa o recebimento de novos pedidos. Catálogo fica visível."}
                </p>
              </div>
              <Switch
                checked={formData.isOpen}
                onCheckedChange={(checked) => handleChange("isOpen", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="w-5 h-5 text-gray-500" />
              Informações do Estabelecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Loja</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: Minha Pastelaria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                WhatsApp para Receber Pedidos
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsappPhone}
                onChange={(e) => handleChange("whatsappPhone", e.target.value)}
                placeholder="Apenas números (Ex: 5567999999999)"
              />
              <p className="text-xs text-gray-500">
                Os pedidos finalizados serão enviados para este número. Inclua o
                código do país (55).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Entrega */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-500" />
              Entrega (Delivery)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Taxa Base de Entrega (R$)</Label>
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.deliveryFee}
                onChange={(e) =>
                  handleChange("deliveryFee", parseFloat(e.target.value) || 0)
                }
              />
              <p className="text-xs text-gray-500">
                Este valor será somado ao total apenas se o cliente escolher
                &quot;Entrega&quot;. Use &quot;0&quot; para frete grátis.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto min-w-[150px]"
          >
            {saving ? (
              "Salvando..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
