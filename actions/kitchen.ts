"use server";

import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function getLiveOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "PREPARING", "READY", "DELIVERING"],
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const serializedOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      deliveryFee: Number(order.deliveryFee),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        product: {
          ...item.product,
          basePrice: Number(item.product.basePrice),
          promotionalPrice: item.product.promotionalPrice
            ? Number(item.product.promotionalPrice)
            : null,
          costPrice: Number(item.product.costPrice),
          stock: Number(item.product.stock),
          minStockLevel: Number(item.product.minStockLevel),
        },
      })),
    }));

    return { success: true, data: serializedOrders };
  } catch (error) {
    console.error("Error fetching live orders:", error);
    return { success: false, data: [] };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    
    const serializedOrder = {
        ...updatedOrder,
        totalAmount: Number(updatedOrder.totalAmount),
        deliveryFee: Number(updatedOrder.deliveryFee),
    }

    return { success: true, data: serializedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: "Erro ao atualizar status" };
  }
}
