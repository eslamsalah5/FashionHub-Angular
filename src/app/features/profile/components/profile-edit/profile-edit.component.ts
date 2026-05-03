import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile-edit',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <main class="profile-page">
      <div class="profile-page__header">
        <h1 class="profile-page__title">Edit Profile</h1>
        <a routerLink="/profile" class="btn btn-secondary">← Back</a>
      </div>

      @if (success()) {
        <div class="alert alert--success" role="status" aria-live="polite">Profile updated successfully!</div>
      }
      @if (errors().length > 0) {
        <div class="alert alert--error" role="alert" aria-live="assertive">
          @for (err of errors(); track err) { <p>{{ err }}</p> }
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="profile-form">
        <div class="form-group">
          <label class="form-label" for="pe-fullName">Full Name *</label>
          <input id="pe-fullName" type="text" class="form-control" formControlName="fullName" aria-required="true" />
        </div>
        <div class="form-group">
          <label class="form-label" for="pe-phone">Phone Number *</label>
          <input id="pe-phone" type="tel" class="form-control" formControlName="phoneNumber" aria-required="true" />
        </div>
        <div class="form-group">
          <label class="form-label" for="pe-address">Address</label>
          <input id="pe-address" type="text" class="form-control" formControlName="address" />
        </div>
        <div class="form-group">
          <label class="form-label" for="pe-dob">Date of Birth</label>
          <input id="pe-dob" type="date" class="form-control" formControlName="dateOfBirth" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="loading()">
            @if (loading()) { <app-loading-spinner size="sm" /> } @else { Save Changes }
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
export class ProfileEditComponent implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly auth           = inject(AuthService);
  private readonly router         = inject(Router);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly errors  = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    fullName:    ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    address:     [''],
    dateOfBirth: [''],
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.profileService.getMyProfile().subscribe({
      next: (user) => {
        let dob = '';
        if (user.dateOfBirth) {
          // Extract just the YYYY-MM-DD part for the date input
          dob = new Date(user.dateOfBirth).toISOString().split('T')[0];
        }
        this.form.patchValue({
          fullName: user.fullName || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          dateOfBirth: dob
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errors.set([]);
    const v = this.form.getRawValue();
    const fd = new FormData();
    Object.entries(v).forEach(([k, val]) => { if (val) fd.append(k, val); });

    const req$ = this.auth.userRole() === 'Admin'
      ? this.profileService.updateAdmin(fd)
      : this.profileService.updateCustomer(fd);

    req$.subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (err: unknown) => {
        const apiErrors = (err as { error?: { errors?: string[] } })?.error?.errors;
        this.errors.set(apiErrors ?? ['Update failed.']);
        this.loading.set(false);
      },
    });
  }
}
