
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock function to get organization ID
const getOrganizationId = async () => {
    const org = await prisma.organization.findFirst();
    if (org) return org.id;
    return (await prisma.organization.create({ data: { name: "Minha Loja", slug: "minha-loja" } })).id;
};

import { Prisma, ProductType } from "@/generated/prisma/client";

export async function getProducts(search?: string, type?: string) {
  const organizationId = await getOrganizationId();
  
  const where: Prisma.ProductWhereInput = { organizationId };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shortName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type && type !== "ALL" && Object.values(ProductType).includes(type as ProductType)) {
    where.type = type as ProductType;
  }

  return await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function createProduct(formData: FormData) {
  const organizationId = await getOrganizationId();
  
  const name = formData.get("name") as string;
  const shortName = formData.get("shortName") as string | null;
  const description = formData.get("description") as string;
  const basePrice = parseFloat(formData.get("basePrice") as string || "0");
  const stock = parseFloat(formData.get("stock") as string || "0");
  const costPrice = parseFloat(formData.get("costPrice") as string || "0");
  const minStockLevel = parseFloat(formData.get("minStockLevel") as string || "0");
  const unit = (formData.get("unit") as string) || "un";
  const serves = parseInt(formData.get("serves") as string || "1");
  const promotionalPrice = parseFloat(formData.get("promotionalPrice") as string || "0");
  
  const type = (formData.get("type") as "ITEM" | "COMPOSITE" | "COMPONENT") || "ITEM";
  const imageUrl = formData.get("imageUrl") as string | null;

  await prisma.product.create({
    data: {
      organizationId,
      name,
      shortName,
      description,
      basePrice,
      stock,
      costPrice,
      minStockLevel,
      unit,
      serves,
      promotionalPrice: promotionalPrice > 0 ? promotionalPrice : null,
      type,
      imageUrl,
    },
  });

  revalidatePath("/produtos");
  return { success: true };
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const shortName = formData.get("shortName") as string | null;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string || "0");
    const stock = parseFloat(formData.get("stock") as string || "0");
    const costPrice = parseFloat(formData.get("costPrice") as string || "0");
    const minStockLevel = parseFloat(formData.get("minStockLevel") as string || "0");
    const unit = (formData.get("unit") as string) || "un";
    const serves = parseInt(formData.get("serves") as string || "1");
    const promotionalPrice = parseFloat(formData.get("promotionalPrice") as string || "0");
    
    const type = (formData.get("type") as "ITEM" | "COMPOSITE" | "COMPONENT") || "ITEM";
    const imageUrl = formData.get("imageUrl") as string | null;
  
    await prisma.product.update({
      where: { id },
      data: {
        name,
        shortName,
        description,
        basePrice,
        stock,
        costPrice,
        minStockLevel,
        unit,
        serves,
        promotionalPrice: promotionalPrice > 0 ? promotionalPrice : null,
        type,
        imageUrl,
      },
    });
  
    revalidatePath("/produtos");
    return { success: true };
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({
        where: { id }
    });
    revalidatePath("/produtos");
}
