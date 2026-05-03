import { ChangeDetectionStrategy, Component, inject, input, OnChanges, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { PaginatedResult, emptyPage } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-search',
  imports: [ProductCardComponent, PaginationComponent, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <main class="product-list-page">
      <header class="product-list-page__header">
        <h1 class="product-list-page__title">
          @if (term()) { Results for "{{ term() }}" } @else { Search Products }
        </h1>
        @if (!loading()) {
          <p class="product-list-page__count" aria-live="polite">{{ result().totalCount }} results</p>
        }
      </header>
      @if (loading()) {
        <app-loading-spinner size="lg" label="Searching..." />
      } @else if (result().items.length === 0) {
        <app-empty-state title="No results found" [message]="'Try a different search term.'" icon="🔍" actionLabel="Browse All" actionRoute="/products" />
      } @else {
        <div class="product-grid" role="list" [attr.aria-label]="'Search results for ' + term()">
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
    .product-list-page__header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-2); }
    .product-list-page__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); }
    .product-list-page__count { font-size: var(--font-size-sm); color: var(--color-text-muted); }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-6); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchComponent implements OnChanges {
  term = input<string>('');

  private readonly productService = inject(ProductService);
  private readonly router         = inject(Router);
  private readonly auth           = inject(AuthService);

  readonly loading  = signal(true);
  readonly result   = signal<PaginatedResult<Product>>(emptyPage(12));
  readonly pageSize = 12;

  get showCart(): boolean { return this.auth.userRole() === 'Customer'; }

  ngOnChanges(): void {
    if (this.term()) this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading.set(true);
    this.productService.searchProducts(this.term(), pageIndex, this.pageSize).subscribe({
      next: res => { this.result.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onViewDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
