import { prisma } from "@/lib/db";
import { ProductCustomizer } from "@/components/shop/product-customizer";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("Serving Product Page ID:", id);

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      modifiers: {
        include: {
          options: {
            include: {
              linkedProduct: true,
            },
            orderBy: { price: "asc" },
          },
        },
        orderBy: { sequence: "asc" },
      },
    },
  });

  if (!product) {
    return notFound();
  }

  // Serialize Decimals to numbers for Client Component
  const serializedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    basePrice: Number(product.basePrice), // fallback if .toNumber() not avail on some versions, but usually is. Number(decimal) works too.
    imageUrl: product.imageUrl,
    modifiers: product.modifiers.map((m) => ({
      id: m.id,
      name: m.name,
      minSelection: m.minSelection,
      maxSelection: m.maxSelection,
      options: m.options.map((o) => ({
        id: o.id,
        name: o.name,
        price: Number(o.price),
        linkedProduct: o.linkedProduct
          ? { imageUrl: o.linkedProduct.imageUrl }
          : null,
      })),
    })),
  };

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Simple Header Back */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-md bg-white/90 backdrop-blur hover:bg-white h-10 w-10"
          >
            <ChevronLeft className="h-6 w-6 text-gray-900" />
          </Button>
        </Link>
      </div>

      <ProductCustomizer product={serializedProduct} />
    </div>
  );
}
