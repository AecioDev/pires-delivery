"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Truck,
  Store,
  Wallet,
  Banknote,
  CreditCard,
  MapPin,
  User,
  Phone,
  FileText,
  Check,
  ChevronRight,
} from "lucide-react";
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

const BRAND_GRADIENT =
  "linear-gradient(135deg, #8B4513 0%, #C17A3C 50%, #D4A96A 100%)";
const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    n,
  );

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function StepBadge({ n, done }: { n: number; done?: boolean }) {
  return (
    <span
      className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
      style={{ background: BRAND_GRADIENT }}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : n}
    </span>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();
  const total = getCartTotal();
  const [loading, startTransition] = useTransition();
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);
  const [settings, setSettings] = useState<{
    isOpen: boolean;
    deliveryFee: number;
  } | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<
    { name: string; fee: number; active: boolean }[]
  >([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    deliveryMethod: "DELIVERY",
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "São Gabriel do Oeste",
      complement: "",
    },
    paymentMethod: "PIX",
    notes: "",
  });

  // Carrega settings, bairros e pré-preenche telefone do localStorage
  useEffect(() => {
    getSettings().then((s) => {
      if (s) setSettings({ isOpen: s.isOpen, deliveryFee: s.deliveryFee });
    });
    getNeighborhoods().then((n) =>
      setNeighborhoods(n.filter((nb) => nb.active)),
    );

    const savedPhone = localStorage.getItem("cpd_customer_phone");
    if (savedPhone) {
      const formatted = formatPhone(savedPhone);
      setFormData((prev) => ({ ...prev, phone: formatted }));
      // Auto-verifica o telefone salvo
      lookupCustomer(savedPhone).then((result) => {
        setIsPhoneChecked(true);
        if (result.found && result.data) {
          setFormData((prev) => ({
            ...prev,
            name: result.data!.name,
            address: result.data!.address
              ? {
                  ...prev.address,
                  street: result.data!.address.street,
                  number: result.data!.address.number,
                  neighborhood: result.data!.address.neighborhood ?? "",
                  complement: result.data!.address.complement || "",
                }
              : prev.address,
          }));
          toast.success(`Olá de volta, ${result.data.name.split(" ")[0]}! 👋`, {
            description: "Dados carregados automaticamente.",
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) router.push("/carrinho");
  }, [items, router]);

  if (items.length === 0) return null;

  const handleField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAddress = (field: string, value: string) =>
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));

  const handlePhoneSubmit = async () => {
    const digits = formData.phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    const result = await lookupCustomer(digits);
    setIsPhoneChecked(true);
    if (result.found && result.data) {
      setFormData((prev) => ({
        ...prev,
        name: result.data!.name,
        address: result.data!.address
          ? {
              ...prev.address,
              street: result.data!.address.street,
              number: result.data!.address.number,
              neighborhood: result.data!.address.neighborhood ?? "",
              complement: result.data!.address.complement || "",
            }
          : prev.address,
      }));
      toast.success(`Olá, ${result.data.name.split(" ")[0]}! 👋`, {
        description: "Dados preenchidos automaticamente.",
      });
    }
  };

  const deliveryFee = (() => {
    if (formData.deliveryMethod !== "DELIVERY") return 0;
    const nb = neighborhoods.find(
      (n) => n.name === formData.address.neighborhood,
    );
    return nb ? nb.fee : (settings?.deliveryFee ?? 0);
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Preencha seu nome e telefone.");
      return;
    }
    if (
      formData.deliveryMethod === "DELIVERY" &&
      (!formData.address.street ||
        !formData.address.number ||
        !formData.address.neighborhood)
    ) {
      toast.error("Preencha o endereço completo para entrega.");
      return;
    }
    startTransition(async () => {
      try {
        const order = await createOrder({
          customer: {
            name: formData.name,
            phone: formData.phone.replace(/\D/g, ""),
          },
          items,
          total,
          deliveryMethod: formData.deliveryMethod,
          address:
            formData.deliveryMethod === "DELIVERY"
              ? formData.address
              : undefined,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        });
        if (!order?.success)
          throw new Error(order?.message || "Erro ao criar pedido");
        clearCart();
        router.push(`/pedido/${order.orderId}/sucesso`);
      } catch {
        toast.error("Erro ao finalizar pedido. Tente novamente.");
      }
    });
  };

  const paymentOptions = [
    {
      value: "PIX",
      label: "PIX",
      sub: "Chave celular / e-mail",
      icon: Wallet,
      color: "text-green-600",
    },
    {
      value: "CARD",
      label: "Cartão",
      sub: "Maquininha com o entregador",
      icon: CreditCard,
      color: "text-blue-600",
    },
    {
      value: "CASH",
      label: "Dinheiro",
      sub: "Troco, se precisar, informe abaixo",
      icon: Banknote,
      color: "text-amber-700",
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-neutral-950 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 px-4 py-3 sticky top-0 z-20 shadow-sm border-b dark:border-neutral-800 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors -ml-1"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">
          Finalizar Pedido
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3 max-w-lg mx-auto">
        {/* ── 1. Contato ── */}
        <section className="bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
            <StepBadge n={1} done={isPhoneChecked} />
            <Phone className="h-4 w-4 text-muted-foreground" />
            {isPhoneChecked ? "Contato" : "Seu WhatsApp / Telefone"}
          </h2>

          <div className="space-y-3">
            {/* Telefone */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) =>
                  handleField("phone", formatPhone(e.target.value))
                }
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all"
              />
              {!isPhoneChecked &&
                formData.phone.replace(/\D/g, "").length >= 10 && (
                  <button
                    type="button"
                    onClick={handlePhoneSubmit}
                    className="w-full mt-2.5 h-11 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    Continuar <ChevronRight className="h-4 w-4" />
                  </button>
                )}
            </div>

            {/* Nome — aparece após verificar telefone */}
            {isPhoneChecked && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                  <User className="h-3 w-3" /> Nome
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleField("name", e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all"
                />
              </div>
            )}
          </div>
        </section>

        {isPhoneChecked && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* ── 2. Entrega ── */}
            <section className="bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-4">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
                <StepBadge n={2} />
                <Truck className="h-4 w-4 text-muted-foreground" />
                Como prefere receber?
              </h2>
              <RadioGroup
                value={formData.deliveryMethod}
                onValueChange={(val) => handleField("deliveryMethod", val)}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "DELIVERY", label: "Entrega", Icon: Truck },
                  { value: "PICKUP", label: "Retirada", Icon: Store },
                ].map(({ value, label, Icon }) => (
                  <div key={value}>
                    <RadioGroupItem
                      value={value}
                      id={value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={value}
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 p-4 cursor-pointer gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 peer-data-[state=checked]:text-white peer-data-[state=checked]:border-transparent transition-all"
                      style={
                        formData.deliveryMethod === value
                          ? { background: BRAND_GRADIENT }
                          : undefined
                      }
                    >
                      <Icon className="h-5 w-5" /> {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Form de endereço */}
              {formData.deliveryMethod === "DELIVERY" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Rua
                      </label>
                      <input
                        type="text"
                        placeholder="Nome da rua"
                        value={formData.address.street}
                        onChange={(e) =>
                          handleAddress("street", e.target.value)
                        }
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/30 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Nº
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={formData.address.number}
                        onChange={(e) =>
                          handleAddress("number", e.target.value)
                        }
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/30 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Bairro
                    </label>
                    <Select
                      value={formData.address.neighborhood}
                      onValueChange={(v) => handleAddress("neighborhood", v)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione o bairro" />
                      </SelectTrigger>
                      <SelectContent>
                        {neighborhoods.map((n) => (
                          <SelectItem key={n.name} value={n.name}>
                            {n.name} — {n.fee > 0 ? fmt(n.fee) : "Grátis"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Complemento (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apto 101, ao lado da padaria..."
                      value={formData.address.complement}
                      onChange={(e) =>
                        handleAddress("complement", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {formData.deliveryMethod === "PICKUP" && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm space-y-1 animate-in fade-in">
                  <p className="font-bold text-amber-800">Nosso endereço:</p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Rua Universal, n. 121
                    <br />
                    Jardim Aero Rancho — Campo Grande/MS
                  </p>
                  <a
                    href="https://maps.google.com/?q=Rua+Universal+121+Jardim+Aero+Rancho+Campo+Grande+MS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-amber-700 mt-1"
                  >
                    <MapPin className="w-4 w-4" /> Ver no Mapa
                  </a>
                </div>
              )}
            </section>

            {/* ── 3. Pagamento ── */}
            <section className="bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-3">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
                <StepBadge n={3} />
                <Wallet className="h-4 w-4 text-muted-foreground" />
                Forma de Pagamento
              </h2>
              <div className="space-y-2">
                {paymentOptions.map(
                  ({ value, label, sub, icon: Icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleField("paymentMethod", value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${formData.paymentMethod === value ? "border-amber-600 bg-amber-50 dark:bg-amber-950/20" : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"}`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === value ? "border-amber-600" : "border-gray-300 dark:border-neutral-600"}`}
                      >
                        {formData.paymentMethod === value && (
                          <div className="w-2 h-2 rounded-full bg-amber-600" />
                        )}
                      </div>
                    </button>
                  ),
                )}
              </div>
            </section>

            {/* ── 4. Observações ── */}
            <section className="bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-3">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
                <StepBadge n={4} />
                <FileText className="h-4 w-4 text-muted-foreground" />
                Observação do Pedido (Opcional)
              </h2>
              <textarea
                placeholder="Ex: Tocar a campainha, troco para R$50..."
                value={formData.notes}
                onChange={(e) => handleField("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all text-gray-900 dark:text-gray-100 placeholder:text-muted-foreground"
              />
            </section>
            {/* ── 5. Resumo do Pedido ── */}
            {isPhoneChecked && (
              <section className="bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-2">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm mb-3">
                  <StepBadge n={5} />
                  Resumo do Pedido
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{fmt(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Taxa de entrega</span>
                    <span
                      className={
                        deliveryFee > 0
                          ? "font-medium text-gray-900 dark:text-gray-100"
                          : "text-green-600 font-medium"
                      }
                    >
                      {deliveryFee > 0 ? fmt(deliveryFee) : "Grátis"}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-base text-gray-900 dark:text-gray-100 border-t dark:border-neutral-800 pt-2">
                    <span>Total a pagar</span>
                    <span>{fmt(total + deliveryFee)}</span>
                  </div>
                </div>
              </section>
            )}
            {isPhoneChecked && (
              <div className="space-y-3">
                {settings && !settings.isOpen && (
                  <div className="text-center py-2 px-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800">
                    🔴 A loja está fechada no momento.
                  </div>
                )}
                <button
                  type="button"
                  disabled={
                    loading || !formData.name || settings?.isOpen === false
                  }
                  onClick={handleSubmit as unknown as React.MouseEventHandler}
                  className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={
                    !loading && formData.name && settings?.isOpen !== false
                      ? { background: BRAND_GRADIENT }
                      : { background: "#9ca3af" }
                  }
                >
                  {loading
                    ? "Enviando..."
                    : settings?.isOpen === false
                      ? "Loja Fechada"
                      : "Finalizar Pedido →"}
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
