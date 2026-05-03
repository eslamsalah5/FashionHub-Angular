export enum OrderStatus {
  Pending    = 1,
  Processing = 2,
  Shipped    = 3,
  Delivered  = 4,
  Cancelled  = 5,
  Returned   = 6,
}

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  productSKU: string;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id?: number;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  orderNotes?: string;
  orderItems: OrderItem[];
}

export interface CreateOrderDto {
  shippingAddress: string;
  orderNotes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}
