import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AddToCartDto, Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http       = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _cartCount = signal<number>(0);
  readonly cartCount = this._cartCount.asReadonly();

  refreshCount(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.http.get<{ data: number }>('/api/cart/count').subscribe({
      next: res => this._cartCount.set(res.data ?? 0),
      error: () => this._cartCount.set(0),
    });
  }

  addToCart(dto: AddToCartDto): Observable<{ data: Cart }> {
    return this.http.post<{ data: Cart; message?: string; statusCode?: number }>('/api/cart/items', dto).pipe(
      tap(() => this.refreshCount())
    );
  }

  resetCount(): void {
    this._cartCount.set(0);
  }
}
