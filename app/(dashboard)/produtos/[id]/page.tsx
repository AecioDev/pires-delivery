import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ModifierList } from "@/components/products/modifier-list";
import { ProductForm } from "@/components/products/product-form";
import { getLinkableProducts } from "@/actions/modifiers";

export default async function ProductDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  // Await params as per Next.js 15+ changes or safe practice even if Next.js 14
  const { id } = await Promise.resolve(params);

  const productPromise = prisma.product.findUnique({
    where: { id },
    include: {
      modifiers: {
        orderBy: { sequence: "asc" },
        include: {
          options: true,
        },
      },
    },
  });

  const linkableProductsPromise = getLinkableProducts();

  const [product, linkableProducts] = await Promise.all([
    productPromise,
    linkableProductsPromise,
  ]);

  if (!product) {
    return notFound();
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/produtos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {product.name}
            {product.type === "COMPOSITE" && (
              <Badge className="bg-orange-500">Montável</Badge>
            )}
            {product.type === "COMPONENT" && (
              <Badge variant="outline">Insumo</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            {product.description || "Sem descrição"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
          {product.type === "COMPOSITE" && (
            <>
              <TabsTrigger value="modifiers">Montagem & Passos</TabsTrigger>
              <TabsTrigger value="recipe">Ficha Técnica</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Produto</CardTitle>
              <CardDescription>Edite as informações básicas.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm
                product={{
                  id: product.id,
                  name: product.name,
                  shortName: product.shortName,
                  description: product.description,
                  basePrice: Number(product.basePrice),
                  stock: Number(product.stock),
                  costPrice: Number(product.costPrice),
                  minStockLevel: Number(product.minStockLevel),
                  unit: product.unit,
                  promotionalPrice: product.promotionalPrice
                    ? Number(product.promotionalPrice)
                    : null,
                  serves: product.serves,
                  type: product.type as "ITEM" | "COMPOSITE" | "COMPONENT",
                  status: product.status as
                    | "ACTIVE"
                    | "INACTIVE"
                    | "UNAVAILABLE",
                  imageUrl: product.imageUrl,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {product.type === "COMPOSITE" && (
          <>
            <TabsContent value="modifiers" className="mt-6 space-y-4">
              {/* Modifiers List Component handles the UI */}
              <ModifierList
                productId={product.id}
                modifiers={product.modifiers.map((m) => ({
                  ...m,
                  options: m.options.map((o) => ({
                    ...o,
                    price: Number(o.price),
                    quantity: Number(o.quantity),
                  })),
                  enablePrice: m.enablePrice,
                }))}
                linkableProducts={linkableProducts.map((p) => ({
                  ...p,
                  basePrice: Number(p.basePrice),
                }))}
              />
            </TabsContent>

            <TabsContent value="recipe" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Composição de Custo</CardTitle>
                  <CardDescription>
                    Quais ingredientes são gastos automaticamente ao vender este
                    item base.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Em breve.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
