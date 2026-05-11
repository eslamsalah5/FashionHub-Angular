# 🛍️ FashionHub — Angular Storefront

FashionHub is a modern, fully responsive e-commerce web application built with **Angular 21**. It delivers a complete online shopping experience — product browsing, cart management, secure Stripe checkout, order tracking, user profiles, and a full Admin Dashboard.

![Angular](https://img.shields.io/badge/Angular-21.2-red?style=flat-square&logo=angular)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-blue?style=flat-square&logo=stripe)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Vitest](https://img.shields.io/badge/Testing-Vitest-yellow?style=flat-square&logo=vitest)


---

## ✨ Features

### 🛒 Customer Experience
- **Product Discovery** — Browse all products, filter by category, explore featured & sale items, and search by keyword
- **Product Detail** — View full product info including images, sizes, colors, ratings, and pricing
- **Shopping Cart** — Add, update, and remove items; live cart badge in the header
- **Secure Checkout** — Stripe-powered payment flow with real-time card validation
- **Order History** — View past orders and individual order details
- **User Profile** — View and edit profile info, upload avatar, change password

### 🛡️ Admin Panel
- **Dashboard** — Quick overview of store operations
- **Product Management** — Full CRUD: create, edit, toggle active/featured status, update stock, soft-delete (recoverable) and hard-delete (permanent)
- **Order Management** — View all customer orders and update their status

### 🔐 Authentication & Authorization
- Register, login, forgot password, and reset password flows
- JWT-based sessions stored in `localStorage` with automatic expiry detection
- Role-based access: **Customer** and **Admin** roles with dedicated route guards
- Automatic logout on 401 responses; redirect to `/access-denied` on 403

---

## 🏗️ Architecture

The project follows a **feature-based architecture** with three distinct layers:

```
src/app/
├── core/           # Singleton services, guards, interceptors, models, DI tokens
├── features/       # Lazy-loaded feature modules (auth, products, cart, checkout, orders, profile, admin)
└── shared/         # Reusable UI components, pipes, and directives
```

### Core Layer
| Type | Files |
|---|---|
| Services | `AuthService`, `CartService` |
| Guards | `authGuard`, `guestGuard`, `roleGuard` |
| Interceptors | `authInterceptor`, `baseUrlInterceptor`, `errorInterceptor` |
| Models | `User`, `Product`, `Cart`, `Order`, `Payment`, `Pagination`, `Auth` |
| DI Tokens | `API_BASE_URL`, `STRIPE_PUBLISHABLE_KEY` |

### Feature Modules (all lazy-loaded)
| Feature | Route | Access |
|---|---|---|
| Auth | `/auth` | Guest only |
| Products | `/products` | Public |
| Cart | `/cart` | Customer only |
| Checkout | `/checkout` | Customer only |
| Orders | `/orders` | Customer only |
| Profile | `/profile` | Authenticated |
| Admin | `/admin` | Admin only |

### Shared Components
| Component | Description |
|---|---|
| `ProductCardComponent` | Reusable product card with add-to-cart and view-detail outputs |
| `PaginationComponent` | Smart pagination with windowed page numbers |
| `LoadingSpinnerComponent` | Configurable spinner (sm / md / lg) |
| `EmptyStateComponent` | Empty state with icon, message, and optional CTA |
| `ConfirmDialogComponent` | Reusable confirmation dialog |

---

## 🔄 Routing

```
/                       → redirects to /products
/auth/login             → Login (guest only)
/auth/register          → Register (guest only)
/auth/forgot-password   → Forgot password (guest only)
/auth/reset-password    → Reset password (guest only)
/products               → Product listing
/products/featured      → Featured products
/products/sale          → Sale products
/products/search        → Search results
/products/category/:cat → Products by category
/products/:id           → Product detail
/cart                   → Shopping cart (Customer)
/checkout               → Checkout with Stripe (Customer)
/orders                 → Order history (Customer)
/orders/:id             → Order detail (Customer)
/profile                → Profile view (Authenticated)
/profile/edit           → Edit profile (Authenticated)
/profile/change-password→ Change password (Authenticated)
/admin                  → Admin dashboard (Admin)
/admin/products         → Product list (Admin)
/admin/products/create  → Create product (Admin)
/admin/products/:id/edit→ Edit product (Admin)
/admin/orders           → Order management (Admin)
/access-denied          → 403 page
```

---

## ⚡ State Management

The app uses **Angular Signals** for reactive state — no NgRx or external state library:

- `AuthService` — signals for `currentUser`, `isAuthenticated`, `userRole`
- `CartService` — signal for `cartCount` (live badge in header)
- Feature services return `Observable` streams from HTTP; components subscribe directly
- All components use `OnPush` change detection for optimal performance

---

## 💳 Stripe Integration

Checkout uses the official `@stripe/stripe-js` library:

1. `CheckoutService.getPaymentMethods()` fetches available gateways from the backend
2. `CheckoutService.createPaymentIntent()` calls the backend to create a Stripe PaymentIntent
3. The `clientSecret` is passed to Stripe Elements for secure card collection
4. The Stripe Publishable Key is injected via the `STRIPE_PUBLISHABLE_KEY` DI token — never hardcoded in components

---

## 🌐 HTTP Layer

Three functional interceptors run in order on every request:

1. **`baseUrlInterceptor`** — Prepends `API_BASE_URL` to all `/api/*` requests
2. **`authInterceptor`** — Attaches `Authorization: Bearer <token>` header (browser only)
3. **`errorInterceptor`** — Handles 401 (auto-logout), 403 (redirect), 409/422 (warnings), 5xx (console error)

API responses follow two shapes:
- **Wrapped**: `{ statusCode, message, data: T }` — used by auth, orders, cart
- **Direct**: `PaginatedResult<T>` — used by product listing endpoints

---

## 🧪 Testing

The project uses **Vitest** instead of the default Karma/Jasmine setup:

```bash
npm test
```

Dev dependencies include:
- `vitest` — fast test runner powered by Vite
- `jsdom` — DOM environment for component tests
- `fast-check` — property-based testing

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v20+**
- npm **v11+**

### Installation

```bash
git clone <your-repo-url>
cd FashionHubAngular
npm install
```

### Environment Setup

Edit `src/environments/environment.ts` for local development:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://your-api-url.com',   // Backend API base URL
  stripePublishableKey: 'pk_test_...',       // Stripe publishable key
  enableQuickAccess: true,                   // Demo accounts toggle
};
```

> The production environment (`environment.prod.ts`) uses `apiBaseUrl: ''` because the Angular app is served from the same origin as the .NET backend (`wwwroot`).

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Production Build

```bash
npm run build
```

Output is written to `../FashionHubApi/Presentation/wwwroot` — ready to be served by the .NET backend.

---

## 📦 Tech Stack

| Category | Technology |
|---|---|
| Framework | Angular 21.2 (Standalone Components, Signals) |
| Language | TypeScript 5.9 (strict mode) |
| Rendering | Client-Side Rendering (CSR) SPA |
| Payments | `@stripe/stripe-js` 9.4 |
| HTTP | Angular `HttpClient` with `withFetch()` |
| Reactivity | Angular Signals + RxJS 7.8 |
| Testing | Vitest 4 + jsdom + fast-check |
| Formatting | Prettier 3.8 |
| Build | Angular CLI 21.2 / `@angular/build` |

---

## 📁 Full Project Structure

```
FashionHubAngular/
├── src/
│   ├── app/
│   │   ├── app.ts                    # Root component
│   │   ├── app.html                  # Shell template (header, router-outlet, footer)
│   │   ├── app.routes.ts             # Root route definitions
│   │   ├── app.config.ts             # Application providers
│   │   ├── core/
│   │   │   ├── guards/               # authGuard, guestGuard, roleGuard
│   │   │   ├── interceptors/         # auth, base-url, error interceptors
│   │   │   ├── models/               # TypeScript interfaces & enums
│   │   │   ├── services/             # AuthService, CartService
│   │   │   ├── store/                # Signal-based store (extensible)
│   │   │   └── tokens/               # API_BASE_URL, STRIPE_PUBLISHABLE_KEY
│   │   ├── features/
│   │   │   ├── auth/                 # Login, Register, Forgot/Reset Password
│   │   │   ├── products/             # List, Detail, Featured, Sale, Search, Category
│   │   │   ├── cart/                 # Cart page
│   │   │   ├── checkout/             # Stripe checkout page
│   │   │   ├── orders/               # Order list & detail
│   │   │   ├── profile/              # View, Edit, Change Password
│   │   │   └── admin/                # Dashboard, Product CRUD, Order Management
│   │   └── shared/
│   │       ├── components/           # ProductCard, Pagination, LoadingSpinner, EmptyState, ConfirmDialog
│   │       ├── directives/           # Custom directives (extensible)
│   │       └── pipes/                # Custom pipes (extensible)
│   ├── environments/
│   │   ├── environment.ts            # Development config
│   │   └── environment.prod.ts       # Production config
│   ├── styles.css                    # Global styles
│   └── main.ts                       # Browser bootstrap
├── public/
│   └── favicon.ico
├── angular.json                      # Angular CLI config
├── tsconfig.json                     # TypeScript config (strict)
├── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## 📝 License

This project is licensed under the MIT License.
