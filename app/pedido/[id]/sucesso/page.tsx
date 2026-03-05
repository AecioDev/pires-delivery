import { getOrder } from "@/actions/checkout";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  MessageCircle,
  MapPin,
  Store,
  Wallet,
} from "lucide-react";

export default async function OrderSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  if (!order) {
    return notFound();
  }

  // Format WhatsApp Message
  const itemsText = order.items
    .map(
      (item) =>
        `${item.quantity}x ${item.product.name} (R$ ${item.unitPrice.toFixed(2)})`,
    )
    .join("\n");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addressSnap = order.addressSnapshot as any;
  const addressText =
    order.deliveryMethod === "DELIVERY" && addressSnap
      ? `*Endereço:* ${addressSnap.street}, ${addressSnap.number} - ${addressSnap.neighborhood}`
      : "";

  const message = `*Novo Pedido #${order.id.slice(0, 8)}*
----------------
${itemsText}
----------------
*Taxa Entrega:* R$ ${order.deliveryFee.toFixed(2)}
*Total:* R$ ${order.totalAmount.toFixed(2)}
*Pagamento:* ${order.paymentMethod}
*Método:* ${order.deliveryMethod === "DELIVERY" ? "Entrega" : "Retirada"}
${addressText}
----------------
*Cliente:* ${order.customer?.name}
*Tel:* ${order.customer?.phone}
${order.notes ? `*Obs:* ${order.notes}` : ""}
`;

  const encodedMessage = encodeURIComponent(message);
  // Default phone fallback if no org or no phone set
  const phone = order.whatsappPhone || "5567992863306";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pt-12 pb-24">
      <div className="bg-green-100 p-4 rounded-full mb-6 relative">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
        Pedido Iniciado!
      </h1>
      <p className="text-gray-600 text-center max-w-sm mb-8">
        Seu pedido foi salvo. Para confirmarmos, por favor, envie este pedido (e
        o comprovante se PIX) no nosso WhatsApp.
      </p>

      {/* UpSell Placeholder */}
      <div className="w-full max-w-sm bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-center border-dashed">
        <p className="text-blue-800 font-bold text-sm">
          ✨ [ToDo] Espaço para Oferta Especial
        </p>
        <p className="text-blue-600 text-xs mt-1">
          Ex: &quot;Que tal adicionar uma Coca 2L por apenas R$ 10?&quot;
        </p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <p className="font-bold text-gray-900">
              Pedido #{order.id.slice(0, 5)}
            </p>
            <p className="text-xs text-gray-400">
              Em nome de {order.customer?.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total a Pagar</p>
            <p className="font-bold text-green-600 text-lg">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {order.deliveryMethod === "DELIVERY" ? (
            <div className="flex gap-3 text-sm text-gray-600">
              <MapPin className="w-5 h-5 shrink-0 text-gray-400" />
              <span>
                Entrega: {addressSnap?.street}, {addressSnap?.number}
              </span>
            </div>
          ) : (
            <div className="flex gap-3 text-sm text-gray-600">
              <Store className="w-5 h-5 shrink-0 text-gray-400" />
              <span>Retirada no Balcão</span>
            </div>
          )}

          <div className="flex gap-3 text-sm text-gray-600">
            <Wallet className="w-5 h-5 shrink-0 text-gray-400" />
            <span>Forma de Pagamento: {order.paymentMethod}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-sm mx-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button className="w-full h-14 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-lg rounded-xl shadow-lg shadow-green-200">
              <MessageCircle className="w-6 h-6 mr-2" />
              Enviar e Confirmar
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
