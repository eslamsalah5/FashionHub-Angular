import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { CheckoutService } from '../../services/checkout.service';
import { CartService } from '../../../../core/services/cart.service';
import { PaymentGateway, PaymentMethodDto } from '../../../../core/models/payment.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { STRIPE_PUBLISHABLE_KEY } from '../../../../core/tokens/stripe.token';

@Component({
  selector: 'app-checkout-page',
  imports: [LoadingSpinnerComponent],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent implements OnDestroy {
  // ── DI ────────────────────────────────────────────────────────────
  private readonly checkoutService   = inject(CheckoutService);
  private readonly cartService       = inject(CartService);
  private readonly router            = inject(Router);
  private readonly platformId        = inject(PLATFORM_ID);
  private readonly stripePublishKey  = inject(STRIPE_PUBLISHABLE_KEY);

  // ── Template ref for the card element mount point ─────────────────
  @ViewChild('cardElement') cardElementRef!: ElementRef<HTMLDivElement>;

  // ── State ─────────────────────────────────────────────────────────
  readonly loading         = signal(true);
  readonly submitting      = signal(false);
  readonly gateways        = signal<PaymentGateway[]>([]);
  readonly selectedGateway = signal<string>('');
  readonly selectedMethod  = signal<string>('');
  readonly error           = signal<string | null>(null);
  readonly success         = signal<boolean>(false);
  /** Stripe-specific inline error (shown under the card field, not the global banner) */
  readonly stripeError     = signal<string | null>(null);
  /** True once the card element has been mounted in the DOM */
  readonly stripeReady     = signal(false);

  // ── Stripe internals (not signals — they're not serialisable) ─────
  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;

  // ── Init ──────────────────────────────────────────────────────────
  constructor() {
    this.checkoutService.getPaymentMethods().subscribe({
      next: g => {
        this.gateways.set(g);
        if (g.length > 0) {
          this.selectedGateway.set(g[0].name);
          const firstMethod = g[0].methods?.[0];
          if (firstMethod) this.selectedMethod.set(firstMethod.key);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load payment methods.');
        this.loading.set(false);
      },
    });
  }

  // ── Gateway / method selection ────────────────────────────────────
  selectGateway(gateway: PaymentGateway): void {
    this.selectedGateway.set(gateway.name);
    this.selectedMethod.set(gateway.methods?.[0]?.key ?? '');
    this.error.set(null);

    // If switching away from Stripe, destroy the card element
    if (gateway.name !== 'stripe') {
      this.destroyCardElement();
    }
  }

  selectMethod(method: PaymentMethodDto): void {
    this.selectedMethod.set(method.key);
  }

  get currentGateway(): PaymentGateway | undefined {
    return this.gateways().find(g => g.name === this.selectedGateway());
  }

  get isStripe(): boolean {
    return this.selectedGateway() === 'stripe';
  }

  get stripeConfigured(): boolean {
    return !!this.stripePublishKey;
  }

  /** Confirm is disabled only while submitting, or for Stripe when card isn't ready */
  get confirmDisabled(): boolean {
    if (this.submitting()) return true;
    if (!this.selectedGateway()) return true;
    if (this.isStripe && this.stripeConfigured && !this.stripeReady()) return true;
    return false;
  }

  // ── Stripe Elements mount ─────────────────────────────────────────
  /**
   * Called from the template via (ngAfterViewInit equivalent):
   * <div #cardElement (click)="mountStripeIfNeeded()"> works but mounting
   * on the container is better. We expose this as a public method and call
   * it from template ngOnInit-style via a dummy `@if` + element directive.
   *
   * Actual mounting: called from template with (mountStripe) output.
   */
  async mountStripeCard(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;  // SSR guard
    if (this.stripe) return;                           // already mounted

    // If Stripe key is not configured, show inline warning (not global error)
    if (!this.stripePublishKey) {
      this.stripeError.set('Stripe is not configured on this server. Please use Paymob instead.');
      return;
    }

    try {
      // Lazy-load Stripe.js only when needed
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(this.stripePublishKey);

      if (!this.stripe) {
        this.error.set('Failed to load Stripe. Please try again.');
        return;
      }

      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1a202c',
            fontFamily: '"Inter", system-ui, sans-serif',
            '::placeholder': { color: '#a0aec0' },
          },
          invalid: { color: '#e53e3e' },
        },
        hidePostalCode: true,
      });

      this.cardElement.mount(this.cardElementRef.nativeElement);
      this.stripeReady.set(true);
      this.stripeError.set(null);

      this.cardElement.on('change', event => {
        this.stripeError.set(event.error?.message ?? null);
      });
    } catch (err) {
      this.stripeError.set('Failed to initialize Stripe. Please refresh and try again.');
    }
  }

  // ── Main checkout action ──────────────────────────────────────────
  onConfirm(): void {
    this.submitting.set(true);
    this.error.set(null);

    this.checkoutService
      .createPaymentIntent({
        gateway: this.selectedGateway(),
        paymentMethod: this.selectedMethod() || undefined,
      })
      .subscribe({
        next: async res => {
          // ── Paymob: redirect to Unified Checkout page ──────────────
          if (res.redirectUrl) {
            window.location.href = res.redirectUrl;
            return;
          }

          // ── Stripe: confirm payment with Stripe.js ─────────────────
          if (res.clientSecret && this.stripe && this.cardElement) {
            const { error, paymentIntent } =
              await this.stripe.confirmCardPayment(res.clientSecret, {
                payment_method: { card: this.cardElement },
              });

            this.submitting.set(false);

            if (error) {
              // Card-level errors (declined, CVV wrong, etc.) → inline message
              this.stripeError.set(error.message ?? 'Payment failed. Please try again.');
              return;
            }

            if (paymentIntent?.status === 'succeeded') {
              this.success.set(true);
              this.cartService.resetCount(); // <-- Empty the cart badge immediately
              // Redirect to orders after 2 s so the user sees the success message
              setTimeout(() => this.router.navigate(['/orders']), 2000);
            }
            return;
          }

          // Gateway returned clientSecret but Stripe is not initialised yet
          if (res.clientSecret && !this.stripe) {
            this.submitting.set(false);
            this.stripeError.set('Please enter your card details in the card field above, then try again.');
            return;
          }

          this.submitting.set(false);
          this.error.set('Invalid payment response. Please try again.');
        },
        error: err => {
          this.error.set(err.message || 'Payment initiation failed. Please try again.');
          this.submitting.set(false);
        },
      });
  }

  // ── Cleanup ───────────────────────────────────────────────────────
  private destroyCardElement(): void {
    this.cardElement?.destroy();
    this.cardElement = null;
    this.stripe = null;
    this.stripeReady.set(false);
  }

  ngOnDestroy(): void {
    this.destroyCardElement();
  }
}
