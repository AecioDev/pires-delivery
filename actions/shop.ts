"use server";

import { prisma } from "@/lib/db";

const getOrganizationId = async () => {
  const org = await prisma.organization.findFirst();
  if (org) return org.id;
  return (
    await prisma.organization.create({
      data: { name: "Pires Delivery", slug: "pires-delivery" },
    })
  ).id;
};

export type ShopOption = {
  id: string;
  name: string;
  price: number;
};

export type ShopModifier = {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
  options: ShopOption[];
};

export type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  promotionalPrice: number | null;
  serves: number | null;
  imageUrl: string | null;
  type: string;
  status: string;
  isDishOfTheDay: boolean;
  modifiers: ShopModifier[];
};

export type ShopCategory = {
  id: string;
  name: string;
  sequence: number;
  products: ShopProduct[];
};

export async function getShopData() {
  const organizationId = await getOrganizationId();

  const [org, categories] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, logoUrl: true },
    }),
    prisma.category.findMany({
      where: { organizationId },
      orderBy: { sequence: "asc" },
      include: {
        products: {
          where: {
            organizationId,
            type: { not: "COMPONENT" },
            status: { not: "INACTIVE" },
          },
          orderBy: { name: "asc" },
          include: {
            modifiers: {
              include: { options: true },
            },
          },
        },
      },
    }),
  ]);

  const shopCategories: ShopCategory[] = categories
    .filter((cat) => cat.products.length > 0)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      sequence: cat.sequence,
      products: cat.products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        basePrice: Number(p.basePrice),
        promotionalPrice: p.promotionalPrice ? Number(p.promotionalPrice) : null,
        serves: p.serves,
        imageUrl: p.imageUrl,
        type: p.type,
        status: p.status,
        isDishOfTheDay: p.isDishOfTheDay,
        modifiers: p.modifiers.map((m) => ({
          id: m.id,
          name: m.name,
          minSelection: m.minSelection,
          maxSelection: m.maxSelection,
          options: m.options.map((o) => ({
            id: o.id,
            name: o.name,
            price: Number(o.price),
          })),
        })),
      })),
    }));

  return {
    storeName: org?.name || "Pires Delivery",
    logoUrl: org?.logoUrl || "/logo_sf.png",
    categories: shopCategories,
  };
}
