"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock function to get organization ID
const getOrganizationId = async () => {
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

export async function getSettings() {
  const organizationId = await getOrganizationId();
  
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      name: true,
      whatsappPhone: true,
      logoUrl: true,
      isOpen: true,
      deliveryFee: true,
    }
  });

  if (!org) return null;

  // Serialize Decimal for client
  return {
    ...org,
    deliveryFee: Number(org.deliveryFee),
  };
}

export async function updateSettings(data: {
  name: string;
  whatsappPhone: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  deliveryFee: number;
}) {
  const organizationId = await getOrganizationId();

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      name: data.name,
      whatsappPhone: data.whatsappPhone,
      logoUrl: data.logoUrl,
      isOpen: data.isOpen,
      deliveryFee: data.deliveryFee,
    },
  });

  revalidatePath("/", "layout"); // Revalidate everything as settings affect global layout
  return { success: true };
}
