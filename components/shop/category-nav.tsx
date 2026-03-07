"use client";

import { useEffect, useRef, useState } from "react";
import { ShopCategory } from "@/actions/shop";

interface CategoryNavProps {
  categories: ShopCategory[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = document.getElementById("shop-scroll-container");
    if (!scrollContainer) return;

    const handleScroll = () => {
      let currentId = categories[0]?.id ?? "";
      const containerTop = scrollContainer.getBoundingClientRect().top;

      for (const cat of categories) {
        const el = document.getElementById(`cat-${cat.id}`);
        if (el) {
          // Position relative to scroll container
          const elTop = el.getBoundingClientRect().top - containerTop;
          if (elTop <= 90) currentId = cat.id;
        }
      }

      setActiveId(currentId);

      // Keep the active category button visible in the nav bar
      if (navRef.current) {
        const activeBtn = navRef.current.querySelector<HTMLElement>(
          `[data-id="${currentId}"]`,
        );
        activeBtn?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollTo = (catId: string) => {
    setActiveId(catId);
    const scrollContainer = document.getElementById("shop-scroll-container");
    const targetEl = document.getElementById(`cat-${catId}`);

    if (!scrollContainer || !targetEl) return;

    // offsetTop relative to scroll container
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const currentScrollTop = scrollContainer.scrollTop;

    // 70px offset to account for sticky nav height
    const newScrollTop =
      currentScrollTop + (targetRect.top - containerRect.top) - 70;

    scrollContainer.scrollTo({ top: newScrollTop, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-gray-50/95 dark:bg-neutral-950/95 backdrop-blur-sm py-2 shadow-sm -mx-4 px-4">
      {/* touch-action: pan-x ensures vertical scroll propagates to parent when user swipes horizontally on the nav */}
      <div
        ref={navRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ touchAction: "pan-x" }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            data-id={cat.id}
            onClick={() => scrollTo(cat.id)}
            className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeId === cat.id
                ? "bg-orange-600 text-white shadow-md"
                : "bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700"
            }`}
          >
            {cat.name}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeId === cat.id
                  ? "bg-white/25 text-white"
                  : "bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-gray-400"
              }`}
            >
              {cat.products.length}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
