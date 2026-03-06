"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, Truck, Store, Wallet, MapPin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createOrder } from "@/actions/checkout";
import { lookupCustomer } from "@/actions/lookup-customer";
import { getSettings } from "@/actions/settings";
import { getNeighborhoods } from "@/actions/neighborhoods";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();
  const total = getCartTotal();
  const [loading, setLoading] = useState(false);
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [settings, setSettings] = useState<{
    isOpen: boolean;
    deliveryFee: number;
  } | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<
    { name: string; fee: number; active: boolean }[]
  >([]);

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        setSettings({ isOpen: s.isOpen, deliveryFee: s.deliveryFee });
      }
    });
    getNeighborhoods().then((n) =>
      setNeighborhoods(n.filter((nb) => nb.active)),
    );
  }, []);

  // ... (formData state remains same)

  // ...

  const handlePhoneSubmit = async () => {
    // Basic validation (at least 8 chars)
    if (formData.phone.length < 8) return;

    // Sanitize phone for lookup
    const cleanPhone = formData.phone.replace(/\D/g, "");

    // Visual feedback could be added here (spinner), but keep it subtle
    const result = await lookupCustomer(cleanPhone);

    setIsPhoneChecked(true);

    if (result.found && result.data) {
      setFormData((prev) => ({
        ...prev,
        name: result.data!.name, // Asserting non-null because logic checks
        address: result.data!.address
          ? {
              ...prev.address,
              street: result.data!.address.street,
              number: result.data!.address.number,
              neighborhood: result.data!.address.neighborhood,
              complement: result.data!.address.complement || "",
            }
          : prev.address,
      }));

      toast.success(`Olá novamente, ${result.data.name.split(" ")[0]}! 👋`, {
        description: "Carregamos seus dados para agilizar.",
      });
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    deliveryMethod: "DELIVERY", // DELIVERY | PICKUP
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "São Gabriel do Oeste", // Default or dynamic
      complement: "",
    },
    paymentMethod: "PIX", // PIX | CASH | CARD
    notes: "",
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push("/carrinho");
    }
  }, [items, router]);

  if (items.length === 0) {
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.phone) {
      toast.error("Por favor, preencha seu nome e telefone.");
      setLoading(false);
      return;
    }

    if (
      formData.deliveryMethod === "DELIVERY" &&
      (!formData.address.street ||
        !formData.address.number ||
        !formData.address.neighborhood)
    ) {
      toast.error("Por favor, preencha o endereço completo para entrega.");
      setLoading(false);
      return;
    }

    try {
      // 1. Save Order to Database
      const cleanPhone = formData.phone.replace(/\D/g, "");
      const order = await createOrder({
        customer: { name: formData.name, phone: cleanPhone },
        items,
        total,
        deliveryMethod: formData.deliveryMethod,
        address:
          formData.deliveryMethod === "DELIVERY" ? formData.address : undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });

      if (!order?.success) {
        throw new Error(order?.message || "Erro ao criar pedido");
      }

      // 2. Clear Cart and Redirect to Success Page
      clearCart();
      router.push(`/pedido/${order.orderId}/sucesso`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao finalizar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-20 shadow-sm flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="-ml-2"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" />
        </Button>
        <h1 className="font-bold text-lg text-gray-900">Finalizar Pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Contact Info */}
        <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
            <span className="bg-orange-100 text-orange-600 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            {isPhoneChecked
              ? "Informe seu Whatsapp e Nome"
              : "Informe seu Whatsapp!"}
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="text-lg font-medium p-6" // Make phone prominent
                  required
                />
              </div>
              {!isPhoneChecked && formData.phone.length > 8 && (
                <Button
                  type="button"
                  onClick={handlePhoneSubmit}
                  className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  Continuar
                </Button>
              )}
            </div>
            {isPhoneChecked && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Ex: João Silva"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-gray-500 pt-3">
                  🔒 Seus dados estarão seguros e serão usados apenas para
                  comunicações sobre sua entrega neste app.
                </p>
              </div>
            )}
          </div>
        </section>

        {isPhoneChecked && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Delivery Method */}
            <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <span className="bg-orange-100 text-orange-600 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Prefere receber em casa ou Vai buscar aqui com a gente?
              </h2>
              <RadioGroup
                defaultValue="DELIVERY"
                value={formData.deliveryMethod}
                onValueChange={(val: string) =>
                  handleInputChange("deliveryMethod", val)
                }
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="DELIVERY"
                    id="delivery"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="delivery"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer text-center gap-2"
                  >
                    <Truck className="mb-1 h-6 w-6" />
                    Entrega
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="PICKUP"
                    id="pickup"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="pickup"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer text-center gap-2"
                  >
                    <Store className="mb-1 h-6 w-6" />
                    Retirada
                  </Label>
                </div>
              </RadioGroup>

              {formData.deliveryMethod === "DELIVERY" && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={formData.address.street}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={formData.address.number}
                        onChange={(e) =>
                          handleAddressChange("number", e.target.value)
                        }
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Select
                      value={formData.address.neighborhood}
                      onValueChange={(val) =>
                        handleAddressChange("neighborhood", val)
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Selecione o Bairro" />
                      </SelectTrigger>
                      <SelectContent>
                        {neighborhoods.map((n) => (
                          <SelectItem key={n.name} value={n.name}>
                            {n.name} - R$ {n.fee.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento (Opcional)</Label>
                    <Input
                      id="complement"
                      value={formData.address.complement}
                      onChange={(e) =>
                        handleAddressChange("complement", e.target.value)
                      }
                      placeholder="Apto 101, Ao lado da padaria..."
                    />
                  </div>
                </div>
              )}

              {formData.deliveryMethod === "PICKUP" && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm space-y-2 animate-in fade-in slide-in-from-top-2">
                  <p className="font-bold text-orange-800">Nosso Endereço:</p>
                  <p className="text-gray-700 leading-relaxed">
                    Rua Universal, n. 121
                    <br />
                    Jardim Aero Rancho
                    <br />
                    Campo Grande - MS
                    <br />
                    CEP: 79.083-380
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Rua+Universal+121+Jardim+Aero+Rancho+Campo+Grande+MS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 font-bold hover:underline mt-1"
                  >
                    <MapPin className="w-4 h-4" />
                    Ver no Mapa
                  </a>
                </div>
              )}
            </section>

            {/* Payment */}
            <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                Pagamento
              </h2>
              <RadioGroup
                defaultValue="PIX"
                value={formData.paymentMethod}
                onValueChange={(val: string) =>
                  handleInputChange("paymentMethod", val)
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 has-data-[state=checked]:border-orange-500 has-data-[state=checked]:bg-orange-50">
                  <RadioGroupItem value="PIX" id="pix" />
                  <Label
                    htmlFor="pix"
                    className="flex-1 cursor-pointer flex items-center gap-2 font-medium"
                  >
                    <Wallet className="w-4 h-4 text-green-600" /> PIX (Chave
                    Celular/Email)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 has-data-[state=checked]:border-orange-500 has-data-[state=checked]:bg-orange-50">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label
                    htmlFor="card"
                    className="flex-1 cursor-pointer font-medium"
                  >
                    Cartão (Entregador leva a máquina)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 has-data-[state=checked]:border-orange-500 has-data-[state=checked]:bg-orange-50">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label
                    htmlFor="cash"
                    className="flex-1 cursor-pointer font-medium"
                  >
                    Dinheiro
                  </Label>
                </div>
              </RadioGroup>
            </section>

            {/* Observations */}
            <section className="bg-white p-4 rounded-xl shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <span className="bg-orange-100 text-orange-600 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </span>
                Alguma observação?
              </h2>
              <Textarea
                placeholder="Ex: Tocar a campainha, tirar a cebola, troco para 50..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="min-h-[80px]"
              />
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 pb-safe">
          {settings && !settings.isOpen && (
            <div className="mb-4 text-center p-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm">
              A loja está fechada no momento.
            </div>
          )}

          <div className="max-w-lg mx-auto">
            {formData.deliveryMethod === "DELIVERY" && (
              <div className="flex justify-between items-center text-sm font-medium pt-3 border-t">
                <span className="text-gray-600">Taxa de Entrega</span>
                <span className="text-gray-900">
                  {formData.deliveryMethod === "DELIVERY"
                    ? (() => {
                        const nb = neighborhoods.find(
                          (n) => n.name === formData.address.neighborhood,
                        );
                        const fee = nb ? nb.fee : settings?.deliveryFee || 0;
                        return fee > 0 ? `+ R$ ${fee.toFixed(2)}` : "Grátis";
                      })()
                    : "Grátis"}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">Total a pagar</div>
              <div className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(
                  total +
                    (formData.deliveryMethod === "DELIVERY"
                      ? (() => {
                          const nb = neighborhoods.find(
                            (n) => n.name === formData.address.neighborhood,
                          );
                          return nb ? nb.fee : settings?.deliveryFee || 0;
                        })()
                      : 0),
                )}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              loading ||
              !isPhoneChecked ||
              !formData.name ||
              settings?.isOpen === false
            }
            className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-100 disabled:opacity-50"
          >
            {loading
              ? "Processando..."
              : settings?.isOpen === false
                ? "Loja Fechada"
                : "Finalizar Pedido"}
          </Button>
        </div>
      </form>
    </div>
  );
}
