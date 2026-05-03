import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product, ProductCategory, Gender, CreateProductDto } from '../../../core/models/product.model';
import { PaginatedResult } from '../../../core/models/pagination.model';
import { Order, UpdateOrderStatusDto } from '../../../core/models/order.model';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';

const PRODUCTS_API = '/api/products';
const ORDERS_API   = '/api/orders';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // ── Product CRUD ──────────────────────────────────────────────────────

  /**
   * GET /api/products?pageIndex=&pageSize=
   * Returns PagedResult<Product> in the body (no X-Pagination header).
   */
  getProducts(pageIndex = 0, pageSize = 10): Observable<PaginatedResult<Product>> {
    return this.http
      .get<PaginatedResult<Product>>(PRODUCTS_API, { params: { pageIndex, pageSize } })
      .pipe(map(page => ({ ...page, items: page.items.map(p => this.normalizeProduct(p)) })));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${PRODUCTS_API}/${id}`).pipe(
      map(p => this.normalizeProduct(p))
    );
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(PRODUCTS_API, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<void> {
    return this.http.put<void>(`${PRODUCTS_API}/${id}`, formData);
  }

  // ── Delete operations ─────────────────────────────────────────────────

  /**
   * DELETE /api/products/:id/soft
   * Marks the product as deleted (IsDeleted = true).
   * Images are PRESERVED on disk — the product can be restored.
   */
  softDeleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${PRODUCTS_API}/${id}/soft`);
  }

  /**
   * DELETE /api/products/:id/hard
   * Permanently removes the product from the DB AND deletes all images from disk.
   * ⚠ This operation is IRREVERSIBLE.
   */
  hardDeleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${PRODUCTS_API}/${id}/hard`);
  }

  // ── Toggle helpers ────────────────────────────────────────────────────

  toggleStatus(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${PRODUCTS_API}/${id}/status`, isActive);
  }

  toggleFeatured(id: number, isFeatured: boolean): Observable<void> {
    return this.http.patch<void>(`${PRODUCTS_API}/${id}/featured`, isFeatured);
  }

  updateStock(id: number, quantity: number): Observable<void> {
    return this.http.patch<void>(`${PRODUCTS_API}/${id}/stock`, quantity);
  }

  // ── Orders ────────────────────────────────────────────────────────────

  getAllOrders(page = 1, pageSize = 10): Observable<Order[]> {
    return this.http
      .get<{ data: { items: Order[] } }>(ORDERS_API + '/admin', { params: { page, pageSize } })
      .pipe(map(r => r.data?.items ?? []));
  }

  updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Observable<Order> {
    return this.http
      .put<{ data: Order }>(`${ORDERS_API}/${id}/status`, dto)
      .pipe(map(r => r.data));
  }

  // ── Normalization helpers ─────────────────────────────────────────────

  /** Map numeric enum values from API to string names, resolve relative image URLs */
  private normalizeProduct(p: Product): Product {
    const categoryMap: Record<number, string> = {
      0: 'Clothing', 1: 'Footwear', 2: 'Accessories', 3: 'Bags',
      4: 'Jewelry',  5: 'Watches',  6: 'Sportswear',  7: 'Underwear',
      8: 'Outerwear', 9: 'Other',
    };
    const genderMap: Record<number, string> = {
      0: 'Men', 1: 'Women', 2: 'Unisex', 3: 'Kids', 4: 'Baby',
    };
    return {
      ...p,
      category:    (categoryMap[p.category as unknown as number] ?? p.category) as ProductCategory,
      gender:      (genderMap[p.gender as unknown as number]     ?? p.gender)   as Gender,
      mainImageUrl: this.resolveUrl(p.mainImageUrl),
    };
  }

  private resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.baseUrl}${path}`;
  }
}
