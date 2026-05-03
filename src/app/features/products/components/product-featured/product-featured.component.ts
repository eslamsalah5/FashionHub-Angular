import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-featured',
  imports: [ProductCardComponent, EmptyStateComponent],
  template: `
    <main class="product-list-page">
      <header class="product-list-page__header">
        <h1 class="product-list-page__title">Featured Products</h1>
      </header>
      @if (loading()) {
        <div class="product-grid" aria-busy="true">
          <div class="skeleton" style="height: 380px"></div>
          <div class="skeleton" style="height: 380px"></div>
          <div class="skeleton" style="height: 380px"></div>
          <div class="skeleton" style="height: 380px"></div>
        </div>
      } @else if (products().length === 0) {
        <app-empty-state title="No featured products" icon="⭐" actionLabel="Browse All" actionRoute="/products" />
      } @else {
        <div class="product-grid" role="list" aria-label="Featured products">
          @for (product of products(); track product.id) {
            <div role="listitem">
              <app-product-card [product]="product" [showAddToCart]="showCart" (viewDetail)="onViewDetail($event)" />
            </div>
          }
        </div>
      }
    </main>
  `,
  styles: [`.product-list-page { padding: var(--space-8) var(--space-4); max-width: 1280px; margin-inline: auto; }
    .product-list-page__header { margin-bottom: var(--space-6); }
    .product-list-page__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-6); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFeaturedComponent {
  private readonly productService = inject(ProductService);
  private readonly router         = inject(Router);
  private readonly auth           = inject(AuthService);

  readonly loading  = signal(true);
  readonly products = signal<Product[]>([]);

  get showCart(): boolean { return this.auth.userRole() === 'Customer'; }

  constructor() {
    this.productService.getFeaturedProducts().subscribe({
      next: p => { this.products.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onViewDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
