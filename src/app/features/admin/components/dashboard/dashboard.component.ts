import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  template: `
    <main class="admin-dashboard">
      <h1 class="admin-dashboard__title">Admin Dashboard</h1>
      <div class="admin-dashboard__cards">
        <a routerLink="/admin/products" class="admin-card">
          <span class="admin-card__icon" aria-hidden="true">👗</span>
          <h2 class="admin-card__title">Products</h2>
          <p class="admin-card__desc">Manage your product catalogue</p>
        </a>
        <a routerLink="/admin/orders" class="admin-card">
          <span class="admin-card__icon" aria-hidden="true">📦</span>
          <h2 class="admin-card__title">Orders</h2>
          <p class="admin-card__desc">View and update order statuses</p>
        </a>
      </div>
    </main>
  `,
  styles: [`
    .admin-dashboard { max-width: 1280px; margin-inline: auto; padding: var(--space-8) var(--space-4); }
    .admin-dashboard__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); margin-bottom: var(--space-8); }
    .admin-dashboard__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-6); }
    .admin-card {
      display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
      padding: var(--space-8); background-color: var(--color-surface);
      border: 1px solid var(--color-border); border-radius: var(--radius-xl);
      text-decoration: none; transition: box-shadow var(--transition-normal), transform var(--transition-normal);
    }
    .admin-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
    .admin-card__icon { font-size: 3rem; }
    .admin-card__title { font-size: var(--font-size-xl); font-weight: 700; color: var(--color-text); }
    .admin-card__desc { font-size: var(--font-size-sm); color: var(--color-text-muted); text-align: center; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
