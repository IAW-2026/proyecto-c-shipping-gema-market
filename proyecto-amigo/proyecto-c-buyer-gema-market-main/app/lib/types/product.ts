/**
 * Tipos de producto según la documentación de la Seller App.
 * @see docs/apis.md  — GET /api/seller/productos
 *
 * Convención: todos los campos en snake_case (per docs/apis.md).
 */

// ── Condición del producto (nuevo/usado) ─────────────────────────────────────
export type ProductCondition = "nuevo" | "usado";

// ── Respuesta del listado: GET /api/seller/productos ──────────────────────────
/** Ítem de producto tal como llega del endpoint de listado de la Seller App. */
export interface ProductListItem {
  product_id: string;
  seller_id: string;
  title: string;
  price: number;
  currency: string; // "ARS"
  category_id: string;
  condition: ProductCondition;
  thumbnail_url: string;
  href: string;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
}

// Uso esos ultimos 4 para enviar a shipping, los recupero con batch product

/** Respuesta paginada del endpoint GET /api/seller/productos. */
// Estos se mostraran en el listado de productos
export interface ProductListResponse {
  items: ProductListItem[];
  page: number;
  page_size: number;
  total: number;
  sort_by?: string;
  order?: string;
}

// ── Detalle completo: GET /api/seller/productos/:product_id ───────────────────
/**
 * Producto con todos sus campos (respuesta del endpoint de detalle).
 * El detalle NO incluye `thumbnail_url`: trae el arreglo `images` con todas las
 * imágenes del producto para mostrar en la galería.
 */
export interface ProductDetail {
  product_id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category_id: string;
  condition: ProductCondition;
  stock: number;
  weight: number; // kg
  height: number; // m
  width: number; // m
  depth: number; // m
  images: string[]; // URLs
  created_at: string; // ISO 8601
}

// ── Categoría: GET /api/seller/categorias ────────────────────────────────────
export interface Category {
  category_id: string; // 'cat_living', etc.
  name: string; // 'Living', etc.
  icon?: string; // 'sofa', etc. (UI)
}

// ── Producto Unificado (Mock & UI) ───────────────────────────────────────────
/**
 * Representación del producto usada en el frontend.
 * Combina datos de la API (snake_case) con campos específicos de la UI (UniHousing).
 */
export interface Product extends ProductListItem {
  oldPrice?: number;
  seller: string;
  glyph: string;
  palette: string[];
  stock: number;
  location: string;
  shipping: number;
  width: number;
  height: number;
  depth: number;
  description?: string;
  images?: string[];
}

// ── Batch: POST /api/seller/productos/batch ───────────────────────────────────
/**
 * Ítem de producto devuelto por el endpoint batch.
 * Coincide con ProductListItem (incluye `thumbnail_url`) más las dimensiones
 * requeridas para cotizar envío. No incluye `description` ni `images`.
 */
export interface BatchProductItem extends ProductListItem {
  stock: number;
  weight: number;
  height: number;
  width: number;
  depth: number;
}

/** Respuesta del endpoint POST /api/seller/productos/batch. */
export interface BatchProductResponse {
  products: BatchProductItem[];
}

// ── Tienda: GET /api/seller/shops/:seller_id ──────────────────────────────────
export interface Shop {
  seller_id: string;
  store_name: string;
  city: string;
  total_products: number;
  categories: Category[];
  products: ProductListResponse;
}

// ── Opciones de ordenamiento ──────────────────────────────────────────────────
export type SortByOption = "price" | "created_at" | "title";
export type OrderOption = "asc" | "desc";

// ── Query params para el listado de productos ─────────────────────────────────
export interface ProductFilters {
  q?: string;
  category_id?: string;
  sort_by?: SortByOption;
  order?: OrderOption;
  min_price?: number;
  max_price?: number;
  condition?: ProductCondition;
  seller_id?: string;
  page?: number;
  page_size?: number;
}
