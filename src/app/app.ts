import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
