"use server";

import { prisma } from "@/lib/db";
import { CartItem } from "@/lib/store/cart";

interface CheckoutData {
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  items: CartItem[];
  total: number;
  deliveryMethod: string; // DELIVERY | PICKUP
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    complement?: string;
  };
  paymentMethod: string;
  notes?: string;
}

export async function createOrder(data: CheckoutData) {
  try {
    // 1. Find predefined Organization (Single Tenant for now)
    const org = await prisma.organization.findFirst();
    if (!org) throw new Error("Organização não encontrada");

    if (!org.isOpen) {
        return { success: false, message: "A loja está fechada no momento." };
    }

    const currentDeliveryFee = data.deliveryMethod === "DELIVERY" ? Number(org.deliveryFee) : 0;
    const finalTotal = data.total + currentDeliveryFee;

    // 2. Find or Create Customer
    let customer = await prisma.customer.findFirst({
        where: {
            organizationId: org.id,
            OR: [
                { phone: data.customer.phone },
                // { email: data.customer.email } // If email is used later
            ]
        }
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                organizationId: org.id,
                name: data.customer.name,
                phone: data.customer.phone,
                // email: data.customer.email
            }
        });
    } else {
        // Optional: Update name if provided
        await prisma.customer.update({
             where: { id: customer.id },
             data: { name: data.customer.name }
        });
    }

    // 3. Save Address if Delivery
    if (data.deliveryMethod === "DELIVERY" && data.address) {
        // Rudimentary address saving - can be improved to avoid dupes
        await prisma.customerAddress.create({
            data: {
                customerId: customer.id,
                street: data.address.street,
                number: data.address.number,
                neighborhood: data.address.neighborhood,
                city: data.address.city,
                complement: data.address.complement,
                isDefault: true // Set latest as default for now
            }
        });
    }

    // 4. Create Order
    const order = await prisma.order.create({
        data: {
            organizationId: org.id,
            customerId: customer.id,
            status: "PENDING",
            totalAmount: finalTotal,
            deliveryFee: currentDeliveryFee, 
            paymentMethod: data.paymentMethod,
            deliveryMethod: data.deliveryMethod as "DELIVERY" | "PICKUP",
            notes: data.notes,
            addressSnapshot: data.address ? (data.address as unknown as object) : undefined, // Cast to any/json
            items: {
                create: data.items.map(item => ({
                     productId: item.product.id,
                     quantity: item.quantity,
                     unitPrice: item.unitPrice,
                     customizations: item.selections // Store the JSON selections
                }))
            }
        }
    });

    return { success: true, orderId: order.id };

  } catch (error) {
    console.error("Order Creation Error:", error);
    return { success: false, message: "Erro ao processar pedido." };
  }
}

export async function getOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return null;

    const org = await prisma.organization.findFirst({
        select: { whatsappPhone: true }
    });

    // Serialize Decimals
    return {
      ...order,
      whatsappPhone: org?.whatsappPhone || null,
      totalAmount: Number(order.totalAmount),
      deliveryFee: Number(order.deliveryFee),
      items: order.items.map(i => ({
        ...i,
        unitPrice: Number(i.unitPrice),
      }))
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
