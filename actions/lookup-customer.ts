"use server";

import { prisma } from "@/lib/db";

export async function lookupCustomer(phone: string) {
  try {
    // 1. Find Organization (Single Tenant)
    const org = await prisma.organization.findFirst();
    if (!org) return { found: false };

    // 2. Find Customer
    const customer = await prisma.customer.findFirst({
      where: {
        organizationId: org.id,
        phone: phone,
      },
      include: {
        addresses: {
          take: 1
        }
      }
    });

    if (!customer) {
      return { found: false };
    }

    // Safely access the first address if it exists
    const lastAddress = customer.addresses[0];

    return {
      found: true,
      data: {
        name: customer.name,
        address: lastAddress ? {
            street: lastAddress.street,
            number: lastAddress.number,
            neighborhood: lastAddress.neighborhood || "",
            complement: lastAddress.complement || "",
        } : null
      }
    };

  } catch (error) {
    console.error("Lookup Error:", error);
    return { found: false };
  }
}
