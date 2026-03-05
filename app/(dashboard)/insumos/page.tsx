
import { getIngredients, deleteIngredient } from "@/actions/ingredients";
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
import { Trash2 } from "lucide-react";
import { IngredientDialog } from "@/components/ingredients/ingredient-dialog";

export default async function IngredientsPage() {
  const ingredients = await getIngredients();

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insumos</h2>
          <p className="text-muted-foreground">
            Gerencie os materiais usados nas suas receitas.
          </p>
        </div>
        <IngredientDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Insumos</CardTitle>
          <CardDescription>
            {ingredients.length} insumos cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade Base</TableHead>
                <TableHead>Custo Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum insumo cadastrado ainda.
                    </TableCell>
                </TableRow>
              )}
              {ingredients.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(item.pricePerUnit))}
                  </TableCell>
                  <TableCell>{Number(item.minStockLevel)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <IngredientDialog ingredient={{
                            ...item,
                            pricePerUnit: Number(item.pricePerUnit),
                            minStockLevel: Number(item.minStockLevel)
                        }} />
                        
                        <form action={deleteIngredient.bind(null, item.id)}>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
