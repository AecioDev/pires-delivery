"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export function ProductFilters({
  hideTypeFilter,
}: {
  hideTypeFilter?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "ALL");

  // Debounce search input to avoid too many URL updates
  const [debouncedSearch] = useDebounce(search, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (type && type !== "ALL") {
      params.set("type", type);
    } else {
      params.delete("type");
    }

    const currentString = searchParams.toString();
    const newString = params.toString();

    if (currentString !== newString) {
      router.push(`${pathname}?${newString}`);
    }
  }, [debouncedSearch, type, router, pathname, searchParams]);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div
          className={`grid grid-cols-1 ${hideTypeFilter ? "" : "sm:grid-cols-[200px_1fr]"} gap-4 items-end`}
        >
          {!hideTypeFilter && (
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ITEM">Simples</SelectItem>
                  <SelectItem value="COMPOSITE">Montável</SelectItem>
                  <SelectItem value="COMPONENT">Insumo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Nome</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
