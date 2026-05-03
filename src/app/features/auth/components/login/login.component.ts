import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

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

  get identifierCtrl() { return this.form.controls.emailOrUsername; }
  get passwordCtrl()   { return this.form.controls.password; }
}
