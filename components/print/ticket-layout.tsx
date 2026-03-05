import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketProps {
  order: {
    id: string;
    createdAt: Date | string;
    customer: { name: string; phone?: string };
    deliveryMethod: string;
    addressSnapshot?: {
      street: string;
      number: string;
      neighborhood: string;
      complement?: string;
    };
    items: {
      quantity: number;
      product: { name: string };
      unitPrice: number;
      customizations?: Record<string, unknown>;
    }[];
    totalAmount: number | string;
    paymentMethod: string;
    notes?: string;
  };
}

export function TicketLayout({ order }: TicketProps) {
  if (!order) return null;

  return (
    <div
      id="print-ticket"
      className="hidden print:block p-2 text-black font-mono text-[12px] leading-tight max-w-[80mm] mx-auto bg-white"
    >
      <div className="text-center border-b border-black pb-2 mb-2">
        <h1 className="text-lg font-bold uppercase">Salgados.ai</h1>
        <p>Pedido #{order.id.slice(0, 8)}</p>
        <p>
          {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
            locale: ptBR,
          })}
        </p>
      </div>

      {/* Customer Info */}
      <div className="border-b border-black pb-2 mb-2">
        <p className="font-bold text-sm">{order.customer?.name}</p>
        <p>{order.customer?.phone}</p>
        {order.deliveryMethod === "DELIVERY" && order.addressSnapshot && (
          <p className="mt-1">
            {order.addressSnapshot.street}, {order.addressSnapshot.number}
            <br />
            {order.addressSnapshot.neighborhood}
            {order.addressSnapshot.complement && (
              <> - {order.addressSnapshot.complement}</>
            )}
          </p>
        )}
        <p className="font-bold mt-1 uppercase">
          {order.deliveryMethod === "DELIVERY" ? "ENTREGA" : "RETIRADA"}
        </p>
      </div>

      {/* Items */}
      <table className="w-full mb-2 border-b border-black pb-2">
        <thead>
          <tr className="text-left border-b border-black">
            <th className="w-[10%]">Qt</th>
            <th className="w-[70%]">Item</th>
            <th className="w-[20%] text-right">R$</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="align-top">
              <td>{item.quantity}x</td>
              <td>
                <span className="font-bold">{item.product.name}</span>
                {item.customizations && (
                  <div className="text-[10px] ml-1">
                    {/* Parse customizations if needed, assume basic list for now */}
                    {/* TODO: Better formatting of customizations */}
                  </div>
                )}
              </td>
              <td className="text-right">
                {(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="text-right text-sm font-bold border-b border-black pb-2 mb-2">
        <p>Total: R$ {Number(order.totalAmount).toFixed(2)}</p>
        <p className="text-[12px] font-normal">
          Pagamento: {order.paymentMethod}
        </p>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border-b border-black pb-2 mb-2">
          <p className="font-bold">Observações:</p>
          <p className="text-sm bg-gray-100 p-1 rounded font-bold">
            {order.notes}
          </p>
        </div>
      )}

      <div className="text-center mt-4 mb-8">
        <p>Obrigado pela preferência!</p>
        <p>www.salgados.ai</p>
      </div>
    </div>
  );
}
