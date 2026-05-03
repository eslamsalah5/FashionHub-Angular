import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  // Route param bound via withComponentInputBinding()
  id = input<string>('');

  private readonly productService = inject(ProductService);
  private readonly auth           = inject(AuthService);
  private readonly cartService    = inject(CartService);
  private readonly router         = inject(Router);

  readonly loading  = signal(true);
  readonly product  = signal<Product | null>(null);
  readonly error    = signal<string | null>(null);
  readonly selectedSize  = signal<string>('');
  readonly selectedColor = signal<string>('');

  ngOnInit(): void {
    const idNum = Number(this.id());
    if (!idNum) { this.error.set('Product not found.'); this.loading.set(false); return; }
    this.productService.getProductById(idNum).subscribe({
      next: p => { this.product.set(p); this.loading.set(false); },
      error: () => { this.error.set('Product not found.'); this.loading.set(false); },
    });
  }

  get sizes(): string[] {
    return this.product()?.availableSizes?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  }

  get colors(): string[] {
    return this.product()?.availableColors?.split(',').map(c => c.trim()).filter(Boolean) ?? [];
  }

  readonly isAdmin    = computed(() => this.auth.userRole() === 'Admin');
  readonly addingCart = signal(false);
  readonly cartError  = signal<string | null>(null);
  readonly cartSuccess = signal(false);

  onAddToCart(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const p = this.product();
    if (!p) return;

    this.addingCart.set(true);
    this.cartError.set(null);
    this.cartSuccess.set(false);

    this.cartService.addToCart({
      productId:     p.id,
      quantity:      1,
      selectedSize:  this.selectedSize() || (this.sizes[0] ?? ''),
      selectedColor: this.selectedColor() || (this.colors[0] ?? ''),
    }).subscribe({
      next: () => {
        this.addingCart.set(false);
        this.cartSuccess.set(true);
        setTimeout(() => this.cartSuccess.set(false), 2500);
      },
      error: (err: unknown) => {
        this.addingCart.set(false);
        // Extract the actual error message from the API response
        const httpErr = err as { error?: { message?: string; Message?: string } };
        const msg = httpErr?.error?.Message
          ?? httpErr?.error?.message
          ?? 'Failed to add to cart. Please try again.';
        this.cartError.set(msg);
      },
    });
  }
}
