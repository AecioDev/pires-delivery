"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock function to get organization ID
const getOrganizationId = async () => {
    const org = await prisma.organization.findFirst();
    if (org) return org.id;
    return (await prisma.organization.create({ data: { name: "Minha Loja", slug: "minha-loja" } })).id;
};

export async function getCategories() {
  const organizationId = await getOrganizationId();
  return await prisma.category.findMany({
    where: { organizationId },
    orderBy: { sequence: "asc" },
  });
}

export async function createCategory(formData: FormData) {
  const organizationId = await getOrganizationId();
  
  const name = formData.get("name") as string;
  const sequence = parseInt(formData.get("sequence") as string || "0");

  if (!name || name.trim() === "") {
    return { success: false, message: "Nome da categoria é obrigatório." };
  }

  // Check unique name per org
  const exists = await prisma.category.findFirst({
    where: { organizationId, name: { equals: name, mode: 'insensitive' } },
  });

  if (exists) {
    return { success: false, message: "Categoria já existe." };
  }

  await prisma.category.create({
    data: {
      organizationId,
      name,
      sequence,
    },
  });

  revalidatePath("/produtos");
  revalidatePath("/");
  return { success: true };
}
