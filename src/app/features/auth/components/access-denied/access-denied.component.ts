import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink],
  template: `
    <div class="access-denied">
      <div class="access-denied__icon" aria-hidden="true">🚫</div>
      <h1 class="access-denied__title">Access Denied</h1>
      <p class="access-denied__message">You do not have permission to view this page.</p>
      <a routerLink="/products" class="btn btn-primary">Back to Shop</a>
    </div>
  `,
  styles: [`
    .access-denied {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: var(--space-4);
      text-align: center;
      padding: var(--space-8);
    }
    .access-denied__icon { font-size: 4rem; }
    .access-denied__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); }
    .access-denied__message { font-size: var(--font-size-lg); color: var(--color-text-muted); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedComponent {}
