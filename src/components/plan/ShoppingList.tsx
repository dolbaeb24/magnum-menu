"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { formatPrice, generateId } from "@/lib/utils";
import {
  ShoppingCart,
  Check,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";

export function ShoppingList() {
  const {
    mealPlan,
    toggleShoppingItem,
    updateShoppingItem,
    removeShoppingItem,
    addShoppingItem,
  } = useAppStore();

  const [newItemName, setNewItemName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  if (!mealPlan) return null;

  const activeItems = mealPlan.shoppingList.filter((i) => !i.checked);
  const checkedItems = mealPlan.shoppingList.filter((i) => i.checked);
  const totalCost = activeItems.reduce((sum, item) => sum + item.price, 0);

  function handleAddItem() {
    if (!newItemName.trim()) return;
    addShoppingItem({
      id: generateId(),
      ingredientName: newItemName.trim(),
      amount: "1 шт",
      price: 0,
      checked: false,
      manualEdit: true,
    });
    setNewItemName("");
    setShowAddForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-500" />
          Список покупок Magnum
        </h2>
        <span className="text-lg font-bold text-orange-600">
          {formatPrice(totalCost)}
        </span>
      </div>

      <p className="text-sm text-gray-500">
        Отметьте продукты, которые уже есть дома. Цены из каталога Magnum Алматы.
      </p>

      <div className="space-y-2">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm group"
          >
            <button
              onClick={() => toggleShoppingItem(item.id)}
              className="flex-shrink-0 w-6 h-6 rounded-lg border-2 border-gray-300 hover:border-orange-400 transition-colors flex items-center justify-center"
            >
            </button>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate capitalize">
                {item.magnumProduct?.name ?? item.ingredientName}
              </p>
              <p className="text-xs text-gray-400">{item.amount}</p>
            </div>

            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              {item.price > 0 ? formatPrice(item.price) : "—"}
            </span>

            <button
              onClick={() => removeShoppingItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {checkedItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">
            ✅ Уже есть дома ({checkedItems.length})
          </p>
          {checkedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60"
            >
              <button
                onClick={() => toggleShoppingItem(item.id)}
                className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center"
              >
                <Check className="w-4 h-4" />
              </button>
              <p className="flex-1 line-through text-gray-500 capitalize truncate">
                {item.magnumProduct?.name ?? item.ingredientName}
              </p>
            </div>
          ))}
        </div>
      )}

      {showAddForm ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Название продукта"
            className="flex-1 px-4 py-2 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400"
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            autoFocus
          />
          <Button size="sm" onClick={handleAddItem}>
            Добавить
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить продукт
        </Button>
      )}

      <a
        href="https://magnum.kz/?city=almaty"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-orange-600 hover:text-orange-700 py-2"
      >
        Открыть каталог Magnum
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
