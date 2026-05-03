import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  id = input<string>('');

  private readonly orderService = inject(OrderService);

  readonly loading = signal(true);
  readonly order   = signal<Order | null>(null);
  readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    const idNum = Number(this.id());
    if (!idNum) { this.error.set('Order not found.'); this.loading.set(false); return; }
    this.orderService.getOrderById(idNum).subscribe({
      next: o => { this.order.set(o); this.loading.set(false); },
      error: () => { this.error.set('Order not found.'); this.loading.set(false); },
    });
  }

  statusLabel(status: OrderStatus): string { return OrderStatus[status] ?? 'Unknown'; }

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
