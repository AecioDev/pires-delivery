"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, ChevronRight } from "lucide-react";
import { upsertCustomerByPhone, skipWelcome } from "@/actions/welcome";

const BRAND_GRADIENT =
  "linear-gradient(135deg, #8B4513 0%, #C17A3C 50%, #D4A96A 100%)";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return value;
}

export default function WelcomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [savePhone, setSavePhone] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleEnter = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      setError("Digite um telefone válido com DDD.");
      return;
    }
    setError("");

    startTransition(async () => {
      const customer = await upsertCustomerByPhone(digits);
      if (savePhone) {
        localStorage.setItem("cpd_customer_id", customer.id);
        localStorage.setItem("cpd_customer_phone", customer.phone ?? "");
      }
      router.replace("/");
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      await skipWelcome();
      router.replace("/");
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12 bg-gray-50 dark:bg-neutral-950">
      {/* Logo + Saudação */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-neutral-800">
          <Image
            src="/logo_sf.png"
            alt="Casa Pires Delivery"
            width={112}
            height={112}
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight">
            Bem-vindo à<br />
            <span
              style={{
                backgroundImage: BRAND_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Casa Pires Delivery!
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 max-w-[260px]">
            Informe seu telefone para acompanhar seus pedidos e receber
            novidades.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="w-full max-w-sm space-y-4">
        {/* Campo telefone */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Phone className="h-4 w-4" /> Seu WhatsApp / Telefone
          </label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhone(e.target.value));
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700 transition-all"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Checkbox salvar */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={savePhone}
              onChange={(e) => setSavePhone(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${savePhone ? "border-transparent" : "border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"}`}
              style={savePhone ? { background: BRAND_GRADIENT } : undefined}
            >
              {savePhone && (
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-tight">
              Manter meu número para próximos pedidos
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Seu número fica salvo apenas neste dispositivo.
            </p>
          </div>
        </label>

        {/* Botão entrar */}
        <button
          onClick={handleEnter}
          disabled={isPending}
          className="w-full h-13 py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-opacity disabled:opacity-60"
          style={{ background: BRAND_GRADIENT }}
        >
          {isPending ? (
            "Aguarde..."
          ) : (
            <>
              Entrar no Cardápio <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Pular */}
        <button
          onClick={handleSkip}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1"
        >
          Continuar sem informar <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Rodapé */}
      <p className="text-xs text-gray-400 dark:text-gray-600 text-center max-w-[260px]">
        Seus dados são usados apenas para facilitar seus pedidos. Não
        compartilhamos com terceiros.
      </p>
    </div>
  );
}
