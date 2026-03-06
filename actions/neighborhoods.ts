"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getNeighborhoods() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return [];

    const items = await prisma.neighborhood.findMany({
      where: { organizationId: org.id },
      orderBy: { name: "asc" },
    });

    // Serialize Decimal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((i: any) => ({
      ...i,
      fee: Number(i.fee),
    }));
  } catch (error) {
    console.error("Failed to fetch neighborhoods:", error);
    return [];
  }
}

export async function createNeighborhood(data: { name: string; fee: number }) {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return { success: false, message: "Organization not found" };

    const existing = await prisma.neighborhood.findFirst({
        where: { organizationId: org.id, name: data.name }
    });

    if (existing) {
        return { success: false, message: "Um bairro com este nome já existe." };
    }

    await prisma.neighborhood.create({
      data: {
        organizationId: org.id,
        name: data.name,
        fee: data.fee,
        active: true,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to create neighborhood:", error);
    return { success: false, message: "Failed to create" };
  }
}

export async function updateNeighborhood(
  id: string,
  data: { name?: string; fee?: number; active?: boolean }
) {
  try {
    await prisma.neighborhood.update({
      where: { id },
      data,
    });

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update neighborhood:", error);
    return { success: false, message: "Failed to update" };
  }
}

export async function deleteNeighborhood(id: string) {
  try {
    await prisma.neighborhood.delete({
      where: { id },
    });

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete neighborhood:", error);
    return { success: false, message: "Failed to delete" };
  }
}
