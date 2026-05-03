import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AdminProductService } from '../../services/admin-product.service';
import { Order, OrderStatus, UpdateOrderStatusDto } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-management',
  imports: [CurrencyPipe, DatePipe],
  template: `
    <main class="admin-page">
      <h1 class="admin-page__title">Orders</h1>
      @if (loading()) {
        <div class="skeleton-table" aria-hidden="true">
          <div class="skeleton-row header"></div>
          @for (i of [1,2,3,4,5]; track i) {
            <div class="skeleton-row"></div>
          }
        </div>
      } @else {
        <div class="table-wrapper" role="region" aria-label="Orders table" tabindex="0">
          <table class="data-table" aria-label="Orders">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
                <th scope="col">Update Status</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td>#{{ order.id }}</td>
                  <td>{{ order.customerName }}</td>
                  <td>{{ order.orderDate | date:'shortDate' }}</td>
                  <td>{{ order.totalAmount | currency }}</td>
                  <td>
                    <span class="badge" [class]="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
                  </td>
                  <td>
                    <select class="form-control status-select"
                      (change)="updateStatus(order, $event)"
                      [disabled]="isTerminalState(order.status)"
                      [attr.aria-label]="'Update status for order ' + order.id">
                      @for (s of statusOptions; track s.value) {
                        <option [value]="s.value" [selected]="s.value === order.status">{{ s.label }}</option>
                      }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </main>
  `,
  styles: [`
    .admin-page { max-width: 1280px; margin-inline: auto; padding: var(--space-8) var(--space-4); }
    .admin-page__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); margin-bottom: var(--space-6); }
    .table-wrapper { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .data-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
    .data-table th { background-color: var(--color-bg-muted); padding: var(--space-3) var(--space-4); text-align: left; font-weight: 600; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); }
    .data-table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .status-select { padding: var(--space-1) var(--space-2); font-size: var(--font-size-xs); }
    .skeleton-table { display: flex; flex-direction: column; gap: var(--space-3); }
    .skeleton-row { height: 48px; background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-bg-muted) 50%, var(--color-surface) 75%); background-size: 200% 100%; border-radius: var(--radius-md); animation: skeleton-loading 1.5s infinite; }
    .skeleton-row.header { height: 40px; background: var(--color-bg-muted); animation: none; }
    @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderManagementComponent {
  private readonly adminService = inject(AdminProductService);

  readonly loading = signal(true);
  readonly orders  = signal<Order[]>([]);

  readonly statusOptions = Object.entries(OrderStatus)
    .filter(([key, value]) => typeof value === 'number' && value !== OrderStatus.Returned)
    .map(([label, value]) => ({ label, value: value as number }));

  constructor() {
    this.adminService.getAllOrders().subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false),
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

  isTerminalState(status: OrderStatus): boolean {
    return status === OrderStatus.Delivered || status === OrderStatus.Cancelled || status === OrderStatus.Returned;
  }

  updateStatus(order: Order, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = Number(select.value) as OrderStatus;

    if (!confirm(`Are you sure you want to change the status of Order #${order.id} to ${OrderStatus[newStatus]}?`)) {
      // Revert the select visually if the user cancels
      select.value = order.status.toString();
      return;
    }

    const dto: UpdateOrderStatusDto = { status: newStatus };
    this.adminService.updateOrderStatus(order.id!, dto).subscribe({
      next: updated => {
        this.orders.update(orders => orders.map(o => o.id === updated.id ? updated : o));
      },
      error: () => {
        // Revert on error
        select.value = order.status.toString();
      }
    });
  }
}
