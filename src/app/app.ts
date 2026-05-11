import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
// RouterLink and RouterLinkActive are used in app.html template
import { CartService } from './core/services/cart.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * True while the Angular router is resolving / lazy-loading a route.
   * Starts as `true` because the first navigation hasn't completed yet.
   * The app template uses this to show a skeleton placeholder inside
   * <main> so the user never sees a blank gap between header & footer.
   */
  readonly routeLoading = signal(true);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.routeLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.routeLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    // Only refresh cart count for Customer — Admin has no cart
    if (this.authService.isAuthenticated() && this.authService.userRole() === 'Customer') {
      this.cartService.refreshCount();
    }
  }

  logout(): void {
    this.authService.logout();
    this.cartService.resetCount();
  }
}
