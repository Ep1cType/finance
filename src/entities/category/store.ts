import { createEffect, createStore, sample } from "effector";
import { createGate } from "effector-react";
import type { Category } from "entity/category/model";
import { fetchWrapper } from "shared/api/fetchWrapper";

export const CategoriesGate = createGate();

export const $categories = createStore<Category.Entity[]>([]);

export const fetchCategoriesFx = createEffect(async () => {
  try {
    const response = await fetchWrapper.get<Category.Entity[]>("/categories");

    if (response.error || !response.data) {
      return [];
      // throw new Error("");
    }

    return response.data;
  } catch (e) {
    return [];
  }
});

sample({
  clock: CategoriesGate.open,
  target: fetchCategoriesFx,
});

$categories.on(fetchCategoriesFx.doneData, (_, categories) => categories);
