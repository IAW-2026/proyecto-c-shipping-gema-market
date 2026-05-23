import type { ProductListItem } from "./product";

export interface CartItemWithProduct extends ProductListItem {
  quantity: number;
  item_id: string;
  stock: number;
}
