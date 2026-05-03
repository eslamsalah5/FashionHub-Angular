export enum ProductCategory {
  Clothing   = 'Clothing',
  Footwear   = 'Footwear',
  Accessories = 'Accessories',
  Bags       = 'Bags',
  Jewelry    = 'Jewelry',
  Watches    = 'Watches',
  Sportswear = 'Sportswear',
  Underwear  = 'Underwear',
  Outerwear  = 'Outerwear',
  Other      = 'Other',
}

export enum Gender {
  Men    = 'Men',
  Women  = 'Women',
  Unisex = 'Unisex',
  Kids   = 'Kids',
  Baby   = 'Baby',
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  isOnSale: boolean;
  stockQuantity: number;
  sku: string;
  category: ProductCategory;
  gender: Gender;
  availableSizes: string;
  availableColors: string;
  brand: string;
  mainImageUrl: string;
  additionalImageUrls: string;
  averageRating: number;
  numberOfRatings: number;
  slug: string;
  isFeatured: boolean;
  isActive: boolean;
  dateCreated: string;
  tags: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  isOnSale?: boolean;
  stockQuantity: number;
  sku: string;
  category: ProductCategory;
  gender: Gender;
  availableSizes?: string;
  availableColors?: string;
  brand: string;
  isFeatured?: boolean;
  tags?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
