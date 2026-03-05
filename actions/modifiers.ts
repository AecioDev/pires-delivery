
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createModifier(productId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const minSelection = parseInt(formData.get("minSelection") as string || "1");
  const maxSelection = parseInt(formData.get("maxSelection") as string || "1");
  const sequence = parseInt(formData.get("sequence") as string || "0");
  const enablePrice = formData.get("enablePrice") === "true";

  await prisma.productModifier.create({
    data: {
      productId,
      name,
      minSelection,
      maxSelection,
      sequence,
      enablePrice,
    },
  });

  revalidatePath(`/produtos/${productId}`);
}

export async function updateModifier(modifierId: string, formData: FormData) {
    const name = formData.get("name") as string;
    const minSelection = parseInt(formData.get("minSelection") as string || "1");
    const maxSelection = parseInt(formData.get("maxSelection") as string || "1");
    const sequence = parseInt(formData.get("sequence") as string || "0");
    const enablePrice = formData.get("enablePrice") === "true";

    // We need to find the productId to revalidate path 
    // or we can pass it in formData, but fetching modifier is safer
    const modifier = await prisma.productModifier.update({
        where: { id: modifierId },
        data: {
            name,
            minSelection,
            maxSelection,
            sequence,
            enablePrice,
        }
    });

    if(modifier) {
        revalidatePath(`/produtos/${modifier.productId}`);
    }
}

export async function deleteModifier(productId: string, modifierId: string) {
  await prisma.productModifier.delete({
    where: { id: modifierId },
  });
  revalidatePath(`/produtos/${productId}`);
}

export async function createModifierOption(productId: string, modifierId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string || "0");
  const quantity = parseFloat(formData.get("quantity") as string || "1");
  let linkedProductId = formData.get("linkedProductId") as string | null;

  if (linkedProductId === "custom" || linkedProductId === "") {
    linkedProductId = null;
  }

  await prisma.modifierOption.create({
    data: {
      modifierId,
      name,
      price,
      quantity,
      linkedProductId,
    },
  });

  revalidatePath(`/produtos/${productId}`);
}

export async function updateModifierOption(productId: string, optionId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string || "0");
  const quantity = parseFloat(formData.get("quantity") as string || "1");
  let linkedProductId = formData.get("linkedProductId") as string | null;

  if (linkedProductId === "custom" || linkedProductId === "") {
    linkedProductId = null;
  }

  await prisma.modifierOption.update({
    where: { id: optionId },
    data: {
      name,
      price,
      quantity,
      linkedProductId,
    },
  });

  revalidatePath(`/produtos/${productId}`);
}

export async function deleteModifierOption(productId: string, optionId: string) {
    await prisma.modifierOption.delete({
        where: { id: optionId }
    });
    revalidatePath(`/produtos/${productId}`);
}

// Helper to fetch linkable products (Insumos/Itens) - STRICTLY COMPONENTS NOW
export async function getLinkableProducts() {
    return await prisma.product.findMany({
        where: {
            type: "COMPONENT" // Only list Insumos
        },
        select: {
            id: true,
            name: true,
            shortName: true,
            basePrice: true,
            type: true,
            unit: true
        },
        orderBy: { name: 'asc' }
    });
}
