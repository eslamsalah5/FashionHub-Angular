import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <main class="profile-page">
      <div class="profile-page__header">
        <h1 class="profile-page__title">Change Password</h1>
        <a routerLink="/profile" class="btn btn-secondary">← Back</a>
      </div>

      @if (success()) {
        <div class="alert alert--success" role="status" aria-live="polite">Password changed successfully!</div>
      }
      @if (errors().length > 0) {
        <div class="alert alert--error" role="alert" aria-live="assertive">
          @for (err of errors(); track err) { <p>{{ err }}</p> }
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="profile-form">
        <div class="form-group">
          <label class="form-label" for="cp-current">Current Password *</label>
          <input id="cp-current" type="password" class="form-control"
            [class.is-invalid]="f.currentPassword.invalid && f.currentPassword.touched"
            formControlName="currentPassword" autocomplete="current-password" aria-required="true"
            [attr.aria-describedby]="f.currentPassword.invalid && f.currentPassword.touched ? 'cp-current-error' : null" />
          @if (f.currentPassword.invalid && f.currentPassword.touched) {
            <span id="cp-current-error" class="form-error" role="alert">Current password is required.</span>
          }
        </div>
        <div class="form-group">
          <label class="form-label" for="cp-new">New Password *</label>
          <input id="cp-new" type="password" class="form-control"
            [class.is-invalid]="f.newPassword.invalid && f.newPassword.touched"
            formControlName="newPassword" autocomplete="new-password" aria-required="true"
            [attr.aria-describedby]="f.newPassword.invalid && f.newPassword.touched ? 'cp-new-error' : null" />
          @if (f.newPassword.invalid && f.newPassword.touched) {
            <span id="cp-new-error" class="form-error" role="alert">
              @if (f.newPassword.errors?.['required']) { New password is required. }
              @else { Password must be at least 6 characters. }
            </span>
          }
        </div>
        <div class="form-group">
          <label class="form-label" for="cp-confirm">Confirm New Password *</label>
          <input id="cp-confirm" type="password" class="form-control"
            [class.is-invalid]="f.confirmNewPassword.invalid && f.confirmNewPassword.touched"
            formControlName="confirmNewPassword" autocomplete="new-password" aria-required="true"
            [attr.aria-describedby]="f.confirmNewPassword.invalid && f.confirmNewPassword.touched ? 'cp-confirm-error' : null" />
          @if (f.confirmNewPassword.invalid && f.confirmNewPassword.touched) {
            <span id="cp-confirm-error" class="form-error" role="alert">Please confirm your new password.</span>
          }
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading()">
            @if (loading()) { <app-loading-spinner size="sm" /> } @else { Change Password }
          </button>
        </div>
      </form>
    </main>
  `,
  styles: [`
    .profile-page { max-width: 640px; margin-inline: auto; padding: var(--space-8) var(--space-4); }
    .profile-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
    .profile-page__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); }
    .profile-form { display: flex; flex-direction: column; gap: var(--space-5); background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-8); }
    .form-actions { padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
    .alert { padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); font-size: var(--font-size-sm); margin-bottom: var(--space-4); }
    .alert--success { background-color: var(--color-success-bg); color: var(--color-primary-800); border: 1px solid var(--color-primary-300); }
    .alert--error { background-color: var(--color-error-bg); color: var(--color-error); border: 1px solid var(--color-error); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {
  private readonly fb             = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly errors  = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    currentPassword:  ['', [Validators.required]],
    newPassword:      ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    if (v.newPassword !== v.confirmNewPassword) {
      this.errors.set(['Passwords do not match.']);
      return;
    }
    this.loading.set(true);
    this.errors.set([]);
    this.profileService.changePassword(v).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); this.form.reset(); },
      error: (err: unknown) => {
        const apiErrors = (err as { error?: { errors?: string[] } })?.error?.errors;
        this.errors.set(apiErrors ?? ['Failed to change password.']);
        this.loading.set(false);
      },
    });
  }

  get f() { return this.form.controls; }
}
