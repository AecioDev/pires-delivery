"use client";

import { useRef, useEffect, useState } from "react";

export function CategoryNav({ categories }: { categories: string[] }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      let currentCategory = categories[0];

      for (const cat of categories) {
        const element = document.getElementById(cat);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjust threshold based on your header height
          if (rect.top <= 120) {
            currentCategory = cat;
          }
        }
      }
      setActiveCategory(currentCategory);

      // Auto-scroll the nav itself so the active button is visible
      if (navRef.current) {
        const activeButton = navRef.current.querySelector(
          `[data-category="${currentCategory}"]`,
        );
        if (activeButton) {
          activeButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const element = document.getElementById(cat);
    if (element) {
      // Get the sticky nav height so we don't scroll past the title
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (categories.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-gray-50/95 dark:bg-neutral-950/95 backdrop-blur-sm pt-2 pb-3 -mx-4 px-4 shadow-sm">
      <div
        ref={navRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            data-category={cat}
            onClick={() => scrollToCategory(cat)}
            className={`flex-none px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap snap-start ${
              activeCategory === cat
                ? "bg-orange-600 text-white shadow-md scale-105"
                : "bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
