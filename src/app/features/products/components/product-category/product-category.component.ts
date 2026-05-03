import { ChangeDetectionStrategy, Component, inject, input, OnChanges, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductCategory } from '../../../../core/models/product.model';
import { PaginatedResult, emptyPage } from '../../../../core/models/pagination.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-category',
  imports: [ProductCardComponent, PaginationComponent, EmptyStateComponent],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCategoryComponent implements OnChanges {
  category = input<string>('');

  private readonly productService = inject(ProductService);
  private readonly router         = inject(Router);
  private readonly auth           = inject(AuthService);

  readonly loading  = signal(true);
  readonly result   = signal<PaginatedResult<Product>>(emptyPage(12));
  readonly pageSize = 12;

  get showCart(): boolean { return this.auth.userRole() === 'Customer'; }

  ngOnChanges(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    const cat = this.category() as ProductCategory;
    if (!cat) return;
    this.loading.set(true);
    this.productService.getProductsByCategory(cat, pageIndex, this.pageSize).subscribe({
      next: res => { this.result.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onViewDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
