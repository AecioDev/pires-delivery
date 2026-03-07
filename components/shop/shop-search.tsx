"use client";

import { Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { ShopCategory } from "@/actions/shop";
import { ProductCard } from "@/components/shop/product-card";

interface ShopSearchProps {
  categories: ShopCategory[];
}

export function ShopSearch({ categories }: ShopSearchProps) {
  const [query, setQuery] = useState("");

  const allProducts = useMemo(
    () => categories.flatMap((c) => c.products),
    [categories],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [query, allProducts]);

  const showResults = query.trim().length > 0;

  return (
    <div className="relative">
      {/* Search input */}
      <div className="relative shadow-sm hover:shadow-md transition-shadow">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar no cardápio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white dark:bg-neutral-900 pl-11 pr-10 h-12 rounded-xl border border-gray-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-base outline-none transition-all text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search results */}
      {showResults && (
        <div className="mt-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum item encontrado para &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground px-1">
                {filtered.length}{" "}
                {filtered.length === 1 ? "resultado" : "resultados"} para &quot;
                {query}&quot;
              </p>
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
