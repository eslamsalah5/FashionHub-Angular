import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Order, UpdateOrderStatusDto } from '../../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  getOrders(): Observable<Order[]> {
    return this.http.get<{ data: Order[] }>('/api/orders').pipe(map(r => r.data ?? []));
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<{ data: Order }>(`/api/orders/${id}`).pipe(map(r => r.data));
  }

  getAllOrders(page = 1, pageSize = 10): Observable<Order[]> {
    return this.http.get<{ data: Order[] }>('/api/orders/admin', { params: { page, pageSize } }).pipe(map(r => r.data ?? []));
  }

  updateOrderStatus(id: number, dto: UpdateOrderStatusDto): Observable<Order> {
    return this.http.put<{ data: Order }>(`/api/orders/${id}/status`, dto).pipe(map(r => r.data));
  }
}
