import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly showQuickAccess = environment.enableQuickAccess;

  readonly form = this.fb.nonNullable.group({
    emailOrUsername: ['', [Validators.required]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    rememberMe:      [false],
  });

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/products']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.error.set('Invalid email/username or password. Please try again.');
        this.loading.set(false);
      },
    });
  }

  /**
   * Quick login with demo accounts for HR presentation
   */
  quickLogin(accountType: 'admin' | 'customer'): void {
    this.loading.set(true);
    this.error.set(null);

    const credentials = accountType === 'admin'
      ? { emailOrUsername: 'admin', password: 'Admin123!', rememberMe: false }
      : { emailOrUsername: 'eslamsalahemdad5346@gmail.com', password: 'Customer123!', rememberMe: false };

    this.auth.login(credentials).subscribe({
      next: () => {
        const returnUrl = accountType === 'admin' 
          ? '/admin/dashboard' 
          : '/products';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.error.set(`Failed to login with ${accountType} demo account. Please ensure the account exists in the database.`);
        this.loading.set(false);
      },
    });
  }

  get identifierCtrl() { return this.form.controls.emailOrUsername; }
  get passwordCtrl()   { return this.form.controls.password; }
}
