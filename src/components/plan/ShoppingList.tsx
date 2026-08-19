"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { formatPrice, generateId } from "@/lib/utils";
import { ShoppingCart, Check, Trash2, Plus, ExternalLink } from "lucide-react";

export function ShoppingList() {
  const {
    mealPlan,
    toggleShoppingItem,
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
    <div className="space-y-3 w-full min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5 min-w-0">
          <ShoppingCart className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="truncate">Покупки Magnum</span>
        </h2>
        <span className="text-base font-bold text-orange-600 shrink-0">
          {formatPrice(totalCost)}
        </span>
      </div>

      <p className="text-xs text-gray-500">
        Отметьте, что уже есть дома
      </p>

      <div className="space-y-2 w-full min-w-0">
        {activeItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm w-full min-w-0"
          >
            <button
              onClick={() => toggleShoppingItem(item.id)}
              className="flex-shrink-0 w-11 h-11 rounded-lg border-2 border-gray-300 active:border-orange-400 flex items-center justify-center"
              aria-label="Отметить как купленное"
            />

            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="font-medium text-gray-900 text-sm break-words line-clamp-2">
                {item.magnumProduct?.name ?? item.ingredientName}
              </p>
              <p className="text-[11px] text-gray-400">{item.amount}</p>
            </div>

            <span className="text-xs font-semibold text-gray-700 shrink-0">
              {item.price > 0 ? formatPrice(item.price) : "—"}
            </span>

            <button
              onClick={() => removeShoppingItem(item.id)}
              className="p-2.5 text-gray-400 active:text-red-500 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {checkedItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium">
            ✅ Есть дома ({checkedItems.length})
          </p>
          {checkedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl opacity-60 min-w-0"
            >
              <button
                onClick={() => toggleShoppingItem(item.id)}
                className="flex-shrink-0 w-11 h-11 rounded-lg bg-emerald-500 text-white flex items-center justify-center"
              >
                <Check className="w-4 h-4" />
              </button>
              <p className="flex-1 line-through text-gray-500 text-sm break-words min-w-0">
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
            className="flex-1 min-w-0 px-3 py-3 border-2 border-orange-200 rounded-xl text-base focus:outline-none focus:border-orange-400"
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            autoFocus
          />
          <Button size="sm" className="shrink-0 min-h-[48px]" onClick={handleAddItem}>
            OK
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full min-h-[48px]"
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
        className="flex items-center justify-center gap-2 text-sm text-orange-600 active:text-orange-700 py-3 min-h-[44px]"
      >
        Открыть Magnum
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
