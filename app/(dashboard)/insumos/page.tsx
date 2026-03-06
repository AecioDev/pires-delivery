import { getProducts, deleteProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, ImageIcon, Pencil } from "lucide-react";
import { ProductManager } from "@/components/products/product-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ProductFilters } from "@/components/products/product-filters";

export default async function InsumosPage(props: {
  searchParams: Promise<{ search?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Fetch only components
  const products = await getProducts(searchParams.search, "COMPONENT");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insumos</h2>
          <p className="text-muted-foreground">
            Gerencie os materiais (ingredientes e embalagens) usados nas suas
            receitas.
          </p>
        </div>
        <ProductManager defaultType="COMPONENT" buttonText="Novo Insumo" />
      </div>

      <ProductFilters hideTypeFilter />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Insumos</CardTitle>
          <CardDescription>
            {products.length} insumos no estoque.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Custo Atual</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum insumo cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
              {products.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={item.imageUrl || ""}
                        alt={item.name}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] md:max-w-md">
                    <div className="flex flex-col">
                      <span className="truncate">{item.name}</span>
                      <span
                        className="text-xs text-muted-foreground truncate"
                        title={item.description || ""}
                      >
                        {item.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.category?.name ? (
                      <Badge
                        variant="outline"
                        className="text-gray-600 font-normal"
                      >
                        {item.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        Sem Categoria
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(item.costPrice))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/produtos/${item.id}`}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                      </Link>

                      <form action={deleteProduct.bind(null, item.id)}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
