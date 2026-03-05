
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock function to get organization ID - In real SaaS this comes from Auth/Session
const getOrganizationId = async () => {
  // TODO: Implement real auth check
  // For now, let's try to find the first org or create a default one
  const org = await prisma.organization.findFirst();
  if (org) return org.id;

  const newOrg = await prisma.organization.create({
    data: {
      name: "Minha Pastelaria",
      slug: "minha-pastelaria",
    },
  });
  return newOrg.id;
};

export async function getIngredients() {
  const organizationId = await getOrganizationId();
  
  return await prisma.ingredient.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createIngredient(formData: FormData) {
  const organizationId = await getOrganizationId();
  
  const name = formData.get("name") as string;
  const unit = formData.get("unit") as string;
  const price = parseFloat(formData.get("price") as string);
  const minStock = parseFloat(formData.get("minStock") as string || "0");

  await prisma.ingredient.create({
    data: {
      organizationId,
      name,
      unit,
      pricePerUnit: price,
      minStockLevel: minStock,
    },
  });

  revalidatePath("/insumos");
  return { success: true };
}

export async function updateIngredient(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const unit = formData.get("unit") as string;
    const price = parseFloat(formData.get("price") as string);
    const minStock = parseFloat(formData.get("minStock") as string || "0");
  
    await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        unit,
        pricePerUnit: price,
        minStockLevel: minStock,
      },
    });
  
    revalidatePath("/insumos");
    return { success: true };
}

export async function deleteIngredient(id: string) {
    // In a real app we should check ownership here
    await prisma.ingredient.delete({
        where: { id }
    });
    revalidatePath("/insumos");
}
