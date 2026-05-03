import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly errors  = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    if (v.newPassword !== v.confirmPassword) {
      this.errors.set(['Passwords do not match.']);
      return;
    }
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    const email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.loading.set(true);
    this.auth.resetPassword({ token, email, newPassword: v.newPassword, confirmPassword: v.confirmPassword }).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err: unknown) => {
        const apiErrors = (err as { error?: { errors?: string[] } })?.error?.errors;
        this.errors.set(apiErrors ?? ['Reset failed. Please try again.']);
        this.loading.set(false);
      },
    });
  }

  get f() { return this.form.controls; }
}
