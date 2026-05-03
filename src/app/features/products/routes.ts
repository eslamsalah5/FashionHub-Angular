import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent),
  },
  {
    path: 'featured',
    loadComponent: () => import('./components/product-featured/product-featured.component').then(m => m.ProductFeaturedComponent),
  },
  {
    path: 'sale',
    loadComponent: () => import('./components/product-sale/product-sale.component').then(m => m.ProductSaleComponent),
  },
  {
    path: 'search',
    loadComponent: () => import('./components/product-search/product-search.component').then(m => m.ProductSearchComponent),
  },
  {
    path: 'category/:category',
    loadComponent: () => import('./components/product-category/product-category.component').then(m => m.ProductCategoryComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
];
