import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-order-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, EmptyStateComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent {
  private readonly orderService = inject(OrderService);

  readonly loading = signal(true);
  readonly orders  = signal<Order[]>([]);

  constructor() {
    this.orderService.getOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: OrderStatus): string {
    return OrderStatus[status] ?? 'Unknown';
  }

  statusClass(status: OrderStatus): string {
    const map: Record<number, string> = {
      [OrderStatus.Pending]:    'badge-warning',
      [OrderStatus.Processing]: 'badge-info',
      [OrderStatus.Shipped]:    'badge-info',
      [OrderStatus.Delivered]:  'badge-success',
      [OrderStatus.Cancelled]:  'badge-error',
      [OrderStatus.Returned]:   'badge-neutral',
    };
    return map[status] ?? 'badge-neutral';
  }
}
