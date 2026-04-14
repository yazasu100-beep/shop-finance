"use client";

import { createContext, useContext, useState, useEffect } from "react";

export interface CategorySet {
  income: string[];
  expense: string[];
}

const DEFAULT_CATEGORIES: CategorySet = {
  income: ["상품판매", "환불수입", "기타수입"],
  expense: ["상품매입", "배송비", "광고비", "플랫폼수수료", "포장재", "인건비", "임대료", "기타지출"],
};

interface CategoryContextType {
  categories: CategorySet;
  addCategory: (type: "income" | "expense", name: string) => void;
  removeCategory: (type: "income" | "expense", name: string) => void;
}

const CategoryContext = createContext<CategoryContextType>({
  categories: DEFAULT_CATEGORIES,
  addCategory: () => {},
  removeCategory: () => {},
});

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<CategorySet>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const saved = localStorage.getItem("app-categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CategorySet;
        if (parsed.income && parsed.expense) setCategories(parsed);
      } catch { /* ignore */ }
    }
  }, []);

  const save = (next: CategorySet) => {
    setCategories(next);
    localStorage.setItem("app-categories", JSON.stringify(next));
  };

  const addCategory = (type: "income" | "expense", name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories[type].includes(trimmed)) return;
    save({ ...categories, [type]: [...categories[type], trimmed] });
  };

  const removeCategory = (type: "income" | "expense", name: string) => {
    save({ ...categories, [type]: categories[type].filter((c) => c !== name) });
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => useContext(CategoryContext);
