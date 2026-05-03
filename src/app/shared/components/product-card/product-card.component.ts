import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  product       = input.required<Product>();
  showAddToCart = input<boolean>(true);

  addToCart  = output<Product>();
  viewDetail = output<Product>();

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.product());
  }
}
