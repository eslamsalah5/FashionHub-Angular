import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PaymentGateway, CreatePaymentIntentDto, PaymentIntentResponse } from '../../../core/models/payment.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);

  getPaymentMethods(): Observable<PaymentGateway[]> {
    return this.http.get<PaymentGateway[]>('/api/payment/methods');
  }

  createPaymentIntent(dto: CreatePaymentIntentDto): Observable<PaymentIntentResponse> {
    return this.http.post<{ isSuccess: boolean; data: PaymentIntentResponse; errors?: string[] }>(
      '/api/payment/create-payment-intent', 
      dto
    ).pipe(
      map(response => {
        if (!response.isSuccess || !response.data) {
          throw new Error(response.errors?.join(', ') || 'Payment initiation failed');
        }
        return response.data;
      })
    );
  }
}
