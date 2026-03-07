import { getShopData } from "@/actions/shop";
import { CategoryNav } from "@/components/shop/category-nav";
import { ProductCard } from "@/components/shop/product-card";
import { ShopSearch } from "@/components/shop/shop-search";
import Image from "next/image";
import { Clock, MapPin } from "lucide-react";

export default async function ShopHomePage() {
  const { storeName, logoUrl, categories } = await getShopData();
  const totalProducts = categories.reduce(
    (acc, c) => acc + c.products.length,
    0,
  );

  return (
    // Fills the main container, split into fixed top + scrollable products
    <div className="flex flex-col h-full min-h-0">
      {/* ── TOP: non-scrolling zone ── */}
      <div className="flex-none px-4 pt-4 pb-0 space-y-3">
        {/* Store Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm border dark:border-neutral-800">
          <div
            className="h-20 flex items-center justify-center relative"
            style={{
              background:
                "linear-gradient(135deg, #8B4513 0%, #C17A3C 40%, #D4A96A 75%, #E8C99A 100%)",
            }}
          >
            <div className="absolute inset-0 bg-black/5" />
            <div className="relative z-10 w-16 h-16 rounded-xl overflow-hidden border-4 border-white dark:border-neutral-800 shadow-lg bg-white">
              <Image
                src={logoUrl}
                alt={`${storeName} Logo`}
                fill
                className="object-contain p-1"
              />
            </div>
          </div>
          <div className="px-4 py-2.5 text-center">
            <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {storeName}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Aberto
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                20–40 min
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {totalProducts} itens
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <ShopSearch categories={categories} />

        {/* Category nav — no longer sticky, just sits in the fixed top zone */}
        <CategoryNav categories={categories} />
      </div>

      {/* ── BOTTOM: scrollable products only ── */}
      <div
        id="shop-scroll-container"
        className="flex-1 overflow-y-auto min-h-0 px-4 pb-4 scrollbar-hide"
      >
        <div className="space-y-8 pt-4">
          {categories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-gray-100 dark:bg-neutral-800" />
                <span className="text-xs text-muted-foreground">
                  {cat.products.length} itens
                </span>
              </div>
              <div className="space-y-3">
                {cat.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="font-medium">Cardápio em breve</p>
              <p className="text-sm mt-1">Nenhum item disponível no momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
