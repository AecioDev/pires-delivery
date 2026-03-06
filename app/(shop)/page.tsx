import { getProducts } from "@/actions/products";
import { getSettings } from "@/actions/settings";
import { ProductCard } from "@/components/shop/product-card";
import { FeaturedProductCard } from "@/components/shop/featured-product-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import { CategoryNav } from "@/components/shop/category-nav";

export default async function ShopHomePage() {
  const settings = await getSettings();
  const storeName = settings?.name || "Salgados.ai";
  const logoUrl = settings?.logoUrl || "/logo_sf.png";

  const allProducts = await getProducts();
  const shopProducts = allProducts.filter(
    (p) => p.type !== "COMPONENT" && p.status !== "INACTIVE",
  );

  // Filter highlights
  const highlights = shopProducts.filter((p) => {
    const isDish = p.isDishOfTheDay;
    const promo = p.promotionalPrice ? Number(p.promotionalPrice) : 0;
    const base = Number(p.basePrice);
    return isDish || (promo > 0 && promo < base);
  });

  // Group products by category
  const categoriesMap = new Map<string, typeof shopProducts>();

  shopProducts.forEach((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catName = (p as any).category?.name || "Diversos";
    if (!categoriesMap.has(catName)) {
      categoriesMap.set(catName, []);
    }
    categoriesMap.get(catName)!.push(p);
  });

  // Extract keys and ensure "Diversos" is at the end if present
  let categoryNames = Array.from(categoriesMap.keys());
  if (categoryNames.includes("Diversos")) {
    categoryNames = categoryNames.filter((c) => c !== "Diversos");
    categoryNames.push("Diversos");
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Store Banner / Info */}
      <div className="bg-white rounded-xl p-4 shadow-sm border text-center space-y-2">
        <div className="flex justify-center mb-2">
          <Image
            src={logoUrl}
            alt={`${storeName} Logo`}
            width={100}
            height={100}
            className="h-24 w-auto object-contain"
          />
        </div>
        <h1 className="text-xl font-bold">{storeName}</h1>
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

      {/* Categories Nav (Sticky & Interactive) */}
      <section>
        <CategoryNav categories={categoryNames} />
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
                  status: p.status,
                  modifiers: [], // Not fetched in list view
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Default padding block for sticky offset compensation */}
      <div className="pt-2">
        {categoryNames.map((catName) => {
          const productsGroup = categoriesMap.get(catName) || [];

          return (
            <section key={catName} id={catName} className="mb-8 scroll-mt-28">
              <h2 className="text-xl font-bold text-foreground mb-4 px-1 pb-2 border-b">
                {catName}
              </h2>
              <div className="space-y-3">
                {productsGroup.map((product) => (
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
                      status: product.status,
                      modifiers: [],
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {shopProducts.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nenhum item disponível.</p>
          </div>
        )}
      </div>
    </div>
  );
}
