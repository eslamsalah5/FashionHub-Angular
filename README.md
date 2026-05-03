# 🛍️ FashionHub - Angular Storefront

FashionHub is a modern, fully responsive e-commerce web application built with **Angular 21**. It offers a complete online shopping experience, including product browsing, cart management, secure checkout with Stripe, user profile functionality, and an entire Admin Dashboard.

![Angular Version](https://img.shields.io/badge/Angular-21.2-red?style=flat-square&logo=angular)
![SSR](https://img.shields.io/badge/SSR-Enabled-success?style=flat-square)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-blue?style=flat-square&logo=stripe)
![Vitest](https://img.shields.io/badge/Testing-Vitest-yellow?style=flat-square&logo=vitest)

## ✨ Key Features

### 🛒 For Shoppers

- **Product Discovery:** Browse by category, search through the catalog, and discover featured & sale items.
- **Shopping Cart:** Add, remove, and manage items in the shopping cart across the session.
- **Secure Checkout:** Full integration with **Stripe** for seamless and secure payment processing.
- **User Accounts:** Registration, login, password recovery, and profile editing.
- **Order Management:** View order history and checkout details.

### 🛡️ For Administrators

- **Dashboard Overview:** Quick insight into store operations.
- **Product Management:** Complete CRUD capabilities for products (Add, Edit, List).
- **Order Tracking:** Manage and fulfill customer orders through the Admin panel.

## 💳 Enterprise-Grade Payment Processing

FashionHub takes financial security and user experience seriously. We implemented a state-of-the-art payment integration:

- **Stripe Integration & PCI Compliance:** Fully integrated with `@stripe/stripe-js` to ensure that sensitive payment data never touches our servers, drastically reducing compliance scopes.
- **Dynamic Payment Architecture:** Using Angular's DI (Dependency Injection) tokens (e.g., `stripe.token.ts`), the Stripe library is effortlessly provided across the checkout features, enabling lazy-loading and better performance.
- **Real-Time Validation & UX:** The checkout component (`checkout-page`) communicates in real-time with Stripe Elements to validate cards and provide instant feedback, significantly reducing cart abandonment.

## 🧪 Robust Testing Infrastructure (Vitest)

We prioritize stability and code reliability that scales. Moving beyond traditional Angular testing setups (Jasmine/Karma), FashionHub adopts **Vitest**:

- **Blazing Fast Execution:** Utilizing Vite's runtime, our tests execute significantly faster, providing an instant feedback loop during development.
- **Comprehensive Coverage:** From testing complex standalone components (using `@angular/core/testing`) to deep validation of reactive `Signals` and RxJS streams.
- **Advanced Mocking Strategy:** Utilizing interceptors (like `error.interceptor.ts` and `base-url.interceptor.ts`) and services, we isolated logic from network requests ensuring tests are highly deterministic and non-flaky.

## 🧩 Architecture & Patterns

The application embraces strict software engineering principles:

- **Feature-Centric Design:** Domains (`auth`, `checkout`, `products`) are completely isolated. This sets the stage for future micro-frontends and robust lazy-loading.
- **Clean Core & Shared Layers:** `/core` handles singletons, guards, interceptors, and state (`/store`), while `/shared` focuses purely on dumb UI components and pipes, enhancing reusability.
- **Modern Angular Reactivity:** Seamless fusion of traditional **RxJS** asynchronous data streams with modern Angular **Signals** for fine-grained reactivity.
- **State Management:** Extracted data-fetching logic inside `/core/store`, decoupling the UI from data fetching concerns entirely.

## 🚀 Tech Stack

- **Framework:** [Angular 21](https://angular.io/) (utilizing Standalone Components, deep Signals integration, and modern control flow)
- **Rendering:** Server-Side Rendering (SSR) via `@angular/ssr` and Express mapping for high SEO scores and blazing-fast Initial Page Loads.
- **Payments:** Stripe ecosystem via `@stripe/stripe-js`
- **Testing:** [Vitest](https://vitest.dev/) for high-speed assertions
- **Architecture:** Feature-based module organization (`core`, `shared`, `features`) aligned with SOLID principles.

## 📁 Project Structure

The codebase is organized adopting strict modularization and clean architecture principles:

```text
src/
├── app/
│   ├── core/           # Singleton services, models, interceptors, and guards.
│   ├── features/       # Feature modules: auth, admin, cart, checkout, products, etc.
│   └── shared/         # Reusable UI components, pipes, and directives.
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+)
- npm (v11+)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd FashionHubAngular
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment:**
   Set up your Stripe Publishable Key and API backend URLs (e.g., in `environments/environment.ts` or via DI tokens like `stripe.token.ts`).

### Development Server

Start a local development server with Hot Module Replacement (HMR):

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Server-Side Rendering (SSR)

To preview the SSR build locally:

```bash
npm run build
npm run serve:ssr:FashionHubAngular
```

### Running Tests

Execute unit tests utilizing the Vitest framework:

```bash
npm test
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📝 License

This project is licensed under the MIT License.
