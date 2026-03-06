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
import { Trash2, UtensilsCrossed, ImageIcon, Pencil } from "lucide-react";
import { ProductManager } from "@/components/products/product-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ProductFilters } from "@/components/products/product-filters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default async function ProductsPage(props: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  const searchParams = await props.searchParams;
  const products = await getProducts(searchParams.search, searchParams.type);
  const displayProducts = products.filter((p) => p.type !== "COMPONENT");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cardápio</h2>
          <p className="text-muted-foreground">
            Gerencie os produtos disponíveis para venda (Macarrão, Bebidas,
            etc).
          </p>
        </div>
        <ProductManager />
      </div>

      <ProductFilters />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {displayProducts.length} itens no cardápio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preço Base</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProducts.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum produto cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
              {displayProducts.map((item) => (
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
                    {item.type === "COMPOSITE" && (
                      <Badge
                        variant="default"
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <UtensilsCrossed className="w-3 h-3 mr-1" /> Montável
                      </Badge>
                    )}
                    {item.type === "COMPONENT" && (
                      <Badge
                        variant="outline"
                        className="border-blue-500 text-blue-500"
                      >
                        Insumo
                      </Badge>
                    )}
                    {item.type === "ITEM" && (
                      <Badge variant="secondary">Simples</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status === "ACTIVE" && (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
                        Ativo
                      </Badge>
                    )}
                    {item.status === "UNAVAILABLE" && (
                      <Badge
                        variant="outline"
                        className="border-orange-200 bg-orange-50 text-orange-700"
                      >
                        Esgotado
                      </Badge>
                    )}
                    {item.status === "INACTIVE" && (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-500"
                      >
                        Oculto
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(item.basePrice))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit Button: Go to Details Page */}
                      <Link href={`/produtos/${item.id}`}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-[425px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Você tem certeza?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá
                              permanentemente o produto{" "}
                              <strong>{item.name}</strong> e o removerá de todos
                              os registros e cardápios.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <form action={deleteProduct.bind(null, item.id)}>
                              <AlertDialogAction
                                type="submit"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sim, excluir produto
                              </AlertDialogAction>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
