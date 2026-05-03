export interface PaymentMethodDto {
  key: string;
  displayName: string;
}

export interface PaymentGateway {
  name: string;
  displayName: string;
  methods?: PaymentMethodDto[];
}

export interface CreatePaymentIntentDto {
  gateway: string;
  paymentMethod?: string;
}

export interface PaymentIntentResponse {
  clientSecret?: string;
  redirectUrl?: string;
  amount?: number;
  publicKey?: string;
  gateway?: string;
}
