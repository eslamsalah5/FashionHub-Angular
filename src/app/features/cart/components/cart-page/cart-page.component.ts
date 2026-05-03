import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Cart, CartItem } from '../../../../core/models/cart.model';
import { CartService } from '../../../../core/services/cart.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CurrencyPipe, EmptyStateComponent],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPageComponent {
  private readonly http        = inject(HttpClient);
  private readonly cartService = inject(CartService);

  readonly loading = signal(true);
  readonly cart    = signal<Cart | null>(null);
  readonly error   = signal<string | null>(null);

  constructor() {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.http.get<{ data: Cart }>('/api/cart').subscribe({
      next: res => { 
        this.cart.set(res.data); 
        this.cartService.refreshCount(); // Keep header in sync
        this.loading.set(false); 
      },
      error: () => { 
        this.error.set('Failed to load cart.'); 
        this.loading.set(false); 
      },
    });
  }

  increase(item: CartItem): void {
    this.http.put<{ data: Cart }>(`/api/cart/items/${item.id}/increase`, {}).subscribe({
      next: res => { this.cart.set(res.data); this.cartService.refreshCount(); },
    });
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) {
      this.remove(item);
      return;
    }
    this.http.put<{ data: Cart }>(`/api/cart/items/${item.id}/decrease`, {}).subscribe({
      next: res => { this.cart.set(res.data); this.cartService.refreshCount(); },
    });
  }

  remove(item: CartItem): void {
    this.http.delete<{ data: Cart }>(`/api/cart/items/${item.id}`).subscribe({
      next: res => { this.cart.set(res.data); this.cartService.refreshCount(); },
    });
  }

  clearCart(): void {
    this.http.delete('/api/cart/clear').subscribe({
      next: () => { this.cart.set(null); this.cartService.resetCount(); },
    });
  }
}
