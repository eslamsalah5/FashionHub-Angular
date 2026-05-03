import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product, ProductCategory, Gender } from '../../../core/models/product.model';
import { PaginatedResult, emptyPage } from '../../../core/models/pagination.model';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';

const API = '/api/products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // ── Normalization ─────────────────────────────────────────────────────

  /** Maps numeric enum values returned by the API to TypeScript string enum names,
   *  and resolves relative image paths to absolute URLs. */
  private normalize(p: Product): Product {
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
      category:     (categoryMap[p.category as unknown as number] ?? p.category) as ProductCategory,
      gender:       (genderMap[p.gender as unknown as number]     ?? p.gender)   as Gender,
      mainImageUrl: this.resolveUrl(p.mainImageUrl),
    };
  }

  private resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.baseUrl}${path}`;
  }

  /** Normalizes a full PagedResult from the API */
  private normalizePage(page: PaginatedResult<Product>): PaginatedResult<Product> {
    return { ...page, items: page.items.map(p => this.normalize(p)) };
  }

  // ── API methods ───────────────────────────────────────────────────────

  /**
   * GET /api/products?pageIndex=&pageSize=
   * Returns a PagedResult<Product> directly in the body (no X-Pagination header).
   */
  getProducts(pageIndex = 0, pageSize = 12): Observable<PaginatedResult<Product>> {
    return this.http
      .get<PaginatedResult<Product>>(API, { params: { pageIndex, pageSize } })
      .pipe(map(page => this.normalizePage(page)));
  }

  /** GET /api/products/:id */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API}/${id}`).pipe(map(p => this.normalize(p)));
  }

  /** GET /api/products/category/:category?pageIndex=&pageSize= */
  getProductsByCategory(
    category: ProductCategory,
    pageIndex = 0,
    pageSize = 12,
  ): Observable<PaginatedResult<Product>> {
    return this.http
      .get<PaginatedResult<Product>>(`${API}/category/${category}`, { params: { pageIndex, pageSize } })
      .pipe(map(page => this.normalizePage(page)));
  }

  /** GET /api/products/featured — returns a plain array (not paged) */
  getFeaturedProducts(): Observable<Product[]> {
    return this.http
      .get<Product[]>(`${API}/featured`)
      .pipe(map(products => products.map(p => this.normalize(p))));
  }

  /** GET /api/products/sale?pageIndex=&pageSize= */
  getSaleProducts(pageIndex = 0, pageSize = 12): Observable<PaginatedResult<Product>> {
    return this.http
      .get<PaginatedResult<Product>>(`${API}/sale`, { params: { pageIndex, pageSize } })
      .pipe(map(page => this.normalizePage(page)));
  }

  /** GET /api/products/search?term=&pageIndex=&pageSize= */
  searchProducts(term: string, pageIndex = 0, pageSize = 12): Observable<PaginatedResult<Product>> {
    return this.http
      .get<PaginatedResult<Product>>(`${API}/search`, { params: { term, pageIndex, pageSize } })
      .pipe(map(page => this.normalizePage(page)));
  }
}
