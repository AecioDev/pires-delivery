"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { getLiveOrders, updateOrderStatus } from "@/actions/kitchen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketLayout } from "@/components/print/ticket-layout";
import { toast } from "sonner";
import { CheckCircle, Truck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Define Types (matching the include structure)
interface OrderItem {
  id: string;
  quantity: number;
  product: { name: string };
  unitPrice: number;
  customizations?: Record<string, unknown>; // Keep any for JSON for now or define stricter
}

interface Order {
  id: string;
  status: string;
  createdAt: Date | string;
  totalAmount: number | string;
  paymentMethod: string;
  deliveryMethod: string;
  notes?: string;
  customer: {
    name: string;
    phone?: string;
  };
  items: OrderItem[];
  addressSnapshot?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
  };
}

// Helper for polling
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevOrdersRef = useRef<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const res = await getLiveOrders();
    if (res.success) {
      const liveOrders = res.data as unknown as Order[];

      // Check for new pending orders to play sound
      // Compare with ref to avoid 'orders' dependency
      const newPending = liveOrders.filter(
        (o) =>
          o.status === "PENDING" &&
          !prevOrdersRef.current.find(
            (old) => old.id === o.id && old.status === "PENDING",
          ),
      );

      if (newPending.length > 0 && prevOrdersRef.current.length > 0) {
        // Play Audio
        if (audioRef.current) {
          audioRef.current
            .play()
            .catch((e) => console.log("Audio play failed", e));
        }

        // Send System Notification (Background support)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Novo Pedido Chegou! 🔔", {
            body: `Pedido #${newPending[0].id.slice(0, 5)} - ${newPending[0].customer.name}`,
            // icon: "/icons/icon-192x192.png" // Optional if we have it
          });
        }

        toast.info("Novo pedido chegou! 🔔");
      }

      setOrders(liveOrders);
      prevOrdersRef.current = liveOrders;
    }
    // setLoading(false);
  }, []); // No dependencies needed

  useInterval(fetchOrders, 5000); // Poll every 5s

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders(); // Initial fetch

    // Initialize audio
    audioRef.current = new Audio("/sounds/alert.mp3");
  }, []); // Run once on mount

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // If accepting (PENDING -> PREPARING), trigger print
    if (newStatus === "PREPARING") {
      const orderToPrint = orders.find((o) => o.id === orderId);
      if (orderToPrint) {
        setPrintOrder(orderToPrint);
        // Small delay to allow react to render the ticket before printing
        setTimeout(() => {
          window.print();
          setPrintOrder(null); // Clear after print dialog opens
        }, 100);
      }
    }

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );

    const res = await updateOrderStatus(
      orderId,
      newStatus as
        | "PENDING"
        | "PREPARING"
        | "READY"
        | "DELIVERING"
        | "COMPLETED"
        | "CANCELLED",
    );
    if (!res.success) {
      toast.error("Erro ao atualizar status");
      fetchOrders(); // Revert
    }
  };

  const columns = {
    PENDING: {
      label: "Pendente",
      color: "bg-red-100 text-red-800",
      icon: Clock,
    },
    PREPARING: {
      label: "Em Preparo",
      color: "bg-yellow-100 text-yellow-800",
      icon: CheckCircle,
    },
    READY: {
      label: "Pronto",
      color: "bg-green-100 text-green-800",
      icon: Truck,
    },
    DELIVERING: {
      label: "Entregando",
      color: "bg-blue-100 text-blue-800",
      icon: Truck,
    },
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cozinha / Pedidos</h1>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 animate-pulse">
            Atualizando ao vivo...
          </span>
        </div>
      </div>

      {/* Hidden Print Area */}
      {printOrder && (
        <div className="print:block hidden absolute top-0 left-0 w-full bg-white z-50">
          <TicketLayout order={printOrder} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4 print:hidden">
        {(Object.keys(columns) as Array<keyof typeof columns>).map((status) => (
          <div key={status} className="flex flex-col gap-3 min-w-[280px]">
            <div
              className={`p-3 rounded-lg font-bold flex items-center gap-2 ${columns[status].color}`}
            >
              <columns.PENDING.icon className="w-4 h-4" />{" "}
              {/* Just a placeholder icon usage, dynamic below */}
              {columns[status].label}
              <Badge variant="secondary" className="ml-auto bg-white/50">
                {orders.filter((o) => o.status === status).length}
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              {orders
                .filter((o) => o.status === status)
                .map((order) => (
                  <Card
                    key={order.id}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm font-bold">
                        #{order.id.slice(0, 5)}
                      </CardTitle>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                      <div>
                        <p className="font-bold text-sm">
                          {order.customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.deliveryMethod}
                        </p>
                      </div>

                      <div className="border-t border-b py-2 text-sm space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.product.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 font-medium">
                          Cannot: {order.notes}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {status === "PENDING" && (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 h-8"
                            onClick={() =>
                              handleStatusChange(order.id, "PREPARING")
                            }
                          >
                            Aceitar & Imprimir
                          </Button>
                        )}
                        {status === "PREPARING" && (
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 h-8"
                            onClick={() =>
                              handleStatusChange(order.id, "READY")
                            }
                          >
                            Pronto
                          </Button>
                        )}
                        {status === "READY" && (
                          <Button
                            className="w-full bg-slate-600 hover:bg-slate-700 h-8"
                            onClick={() =>
                              handleStatusChange(order.id, "DELIVERING")
                            }
                          >
                            Saiu
                          </Button>
                        )}
                        {status === "DELIVERING" && (
                          <Button
                            className="w-full variant-outline h-8"
                            onClick={() =>
                              handleStatusChange(order.id, "COMPLETED")
                            }
                          >
                            Finalizar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {orders.filter((o) => o.status === status).length === 0 && (
                <div className="text-center p-8 text-gray-400 border-2 border-dashed rounded-lg text-sm bg-gray-50/50">
                  Sem pedidos
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
