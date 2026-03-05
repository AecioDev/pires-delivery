import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/shop/product-card";
import { FeaturedProductCard } from "@/components/shop/featured-product-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";

export default async function ShopHomePage() {
  const allProducts = await getProducts();
  const shopProducts = allProducts.filter((p) => p.type !== "COMPONENT");

  // Filter highlights
  const highlights = shopProducts.filter((p) => {
    const isDish = p.isDishOfTheDay;
    const promo = p.promotionalPrice ? Number(p.promotionalPrice) : 0;
    const base = Number(p.basePrice);
    return isDish || (promo > 0 && promo < base);
  });

  const categories = [
    "Todos",
    "Mais Pedidos",
    "Combos",
    "Bebidas",
    "Sobremesas",
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Store Banner / Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border text-center space-y-2">
        <div className="flex justify-center mb-2">
          <Image
            src="/logo_sf.png"
            alt="Casa Pires Logo"
            width={100}
            height={100}
            className="h-24 w-auto object-contain"
          />
        </div>
        <h1 className="text-xl font-bold">Casa Pires Delivery</h1>
        <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <span>Aberto agora</span>
          <span>•</span>
          <span>20-30 min</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative shadow-sm hover:shadow-md transition-shadow">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar no cardápio..."
          className="w-full bg-white pl-11 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 text-base"
        />
      </div>

      {/* Categories */}
      <section>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                i === 0
                  ? "bg-foreground text-background font-bold border-foreground"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Destaques (Dynamic) */}
      {highlights.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3 px-1">
            Destaques
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {highlights.map((p) => (
              <FeaturedProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  description: p.description,
                  basePrice: Number(p.basePrice),
                  promotionalPrice: p.promotionalPrice
                    ? Number(p.promotionalPrice)
                    : null,
                  serves: p.serves,
                  isDishOfTheDay: p.isDishOfTheDay,
                  imageUrl: p.imageUrl,
                  type: p.type,
                  modifiers: [], // Not fetched in list view
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Product List */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3 px-1">
          Cardápio
        </h2>
        <div className="space-y-3">
          {shopProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                description: product.description,
                basePrice: Number(product.basePrice),
                promotionalPrice: product.promotionalPrice
                  ? Number(product.promotionalPrice)
                  : null,
                serves: product.serves,
                imageUrl: product.imageUrl,
                type: product.type,
                modifiers: [],
              }}
            />
          ))}
        </div>

        {shopProducts.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nenhum item disponível.</p>
          </div>
        )}
      </section>
    </div>
  );
}
