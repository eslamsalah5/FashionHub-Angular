import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../../../core/models/product.model';
import { PaginatedResult, emptyPage } from '../../../../core/models/pagination.model';
import { CartService } from '../../../../core/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent, PaginationComponent, EmptyStateComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly cartService    = inject(CartService);
  readonly auth                   = inject(AuthService);
  private readonly router         = inject(Router);

  readonly loading  = signal(true);
  readonly result   = signal<PaginatedResult<Product>>(emptyPage(12));
  readonly pageSize = 12;

  /** Show Add to Cart only for Customers (not Admin, not unauthenticated) */
  get showCart(): boolean {
    return this.auth.userRole() === 'Customer';
  }

  constructor() {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading.set(true);
    this.productService.getProducts(pageIndex, this.pageSize).subscribe({
      next: res => { this.result.set(res); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onAddToCart(product: Product): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }
    this.cartService.addToCart({
      productId:     product.id,
      quantity:      1,
      selectedSize:  product.availableSizes?.split(',')[0]?.trim() ?? '',
      selectedColor: product.availableColors?.split(',')[0]?.trim() ?? '',
    }).subscribe({
      error: () => { /* silently ignore — user can retry from product detail */ }
    });
  }

  onViewDetail(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
