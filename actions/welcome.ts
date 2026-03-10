"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * Busca ou cria um cliente pelo telefone.
 * Também seta o cookie `cpd_welcomed` para não mostrar a tela de boas-vindas novamente.
 */
export async function upsertCustomerByPhone(phone: string) {
  // Busca a organização (primeira, pois é single-tenant por ora)
  const org = await prisma.organization.findFirst();
  if (!org) throw new Error("Organização não encontrada");

  // Normaliza o telefone removendo não-dígitos
  const normalized = phone.replace(/\D/g, "");

  // Cria ou busca o cliente
  let customer = await prisma.customer.findFirst({
    where: { organizationId: org.id, phone: normalized },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        organizationId: org.id,
        phone: normalized,
        name: "Cliente", // será atualizado no checkout
      },
    });
  }

  // Seta o cookie de boas-vindas (1 ano)
  const cookieStore = await cookies();
  cookieStore.set("cpd_welcomed", "1", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return { id: customer.id, phone: customer.phone, name: customer.name };
}

/**
 * Apenas marca que o cliente viu a tela de boas-vindas (sem telefone).
 */
export async function skipWelcome() {
  const cookieStore = await cookies();
  cookieStore.set("cpd_welcomed", "1", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}
