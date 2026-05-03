export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Cart {
  id: number;
  customerId: string;
  createdAt: string;
  modifiedAt: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface AddToCartDto {
  productId: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface UpdateCartItemDto {
  cartItemId: number;
  quantity: number;
}
