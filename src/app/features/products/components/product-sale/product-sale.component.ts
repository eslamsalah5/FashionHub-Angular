import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { PaginatedResult, emptyPage } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-sale',
  imports: [ProductCardComponent, PaginationComponent, EmptyStateComponent],
  template: `
    <main class="product-list-page">
      <header class="product-list-page__header">
        <h1 class="product-list-page__title">Sale</h1>
        <span class="badge badge-success" aria-label="Sale items">Hot Deals</span>
      </header>
      @if (loading()) {
        <div class="product-grid" aria-busy="true">
          <div class="skeleton" style="height: 380px"></div>
          <div class="skeleton" style="height: 380px"></div>
          <div class="skeleton" style="height: 380px"></div>
          <div class="skeleton" style="height: 380px"></div>
        </div>
      } @else if (result().items.length === 0) {
        <app-empty-state title="No sale items right now" icon="🏷️" actionLabel="Browse All" actionRoute="/products" />
      } @else {
        <div class="product-grid" role="list" aria-label="Sale products">
          @for (product of result().items; track product.id) {
            <div role="listitem">
              <app-product-card [product]="product" [showAddToCart]="showCart" (viewDetail)="onViewDetail($event)" />
            </div>
          }
        </div>
        <app-pagination [currentPage]="result().pageIndex" [totalCount]="result().totalCount" [pageSize]="pageSize" (pageChange)="loadPage($event)" />
      }
    </main>
  `,
  styles: [`.product-list-page { padding: var(--space-8) var(--space-4); max-width: 1280px; margin-inline: auto; }
    .product-list-page__header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6); }
    .product-list-page__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-6); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSaleComponent {
  private readonly productService = inject(ProductService);
  private readonly router         = inject(Router);
  private readonly auth           = inject(AuthService);

  readonly loading  = signal(true);
  readonly result   = signal<PaginatedResult<Product>>(emptyPage(12));
  readonly pageSize = 12;

  get showCart(): boolean { return this.auth.userRole() === 'Customer'; }

  constructor() { this.loadPage(0); }

  loadPage(pageIndex: number): void {
    this.loading.set(true);
    this.productService.getSaleProducts(pageIndex, this.pageSize).subscribe({
      next: res => { this.result.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onViewDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
