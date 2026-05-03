import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading        = signal(false);
  readonly success        = signal(false);
  readonly errors         = signal<string[]>([]);
  readonly profileFile    = signal<File | null>(null);
  readonly profilePreview = signal<string>('');

  readonly form = this.fb.nonNullable.group({
    fullName:        ['', [Validators.required, Validators.maxLength(100)]],
    email:           ['', [Validators.required, Validators.email]],
    phoneNumber:     ['', [Validators.required]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    address:         [''],
  });

  onProfilePictureChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.profileFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.profilePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeProfilePicture(): void {
    this.profileFile.set(null);
    this.profilePreview.set('');
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    if (v.password !== v.confirmPassword) {
      this.errors.set(['Passwords do not match.']);
      return;
    }
    this.loading.set(true);
    this.errors.set([]);

    const fd = new FormData();
    fd.append('fullName',        v.fullName);
    fd.append('email',           v.email);
    fd.append('phoneNumber',     v.phoneNumber);
    fd.append('password',        v.password);
    fd.append('confirmPassword', v.confirmPassword);
    if (v.address) fd.append('address', v.address);

    const pic = this.profileFile();
    if (pic) fd.append('profilePicture', pic, pic.name);

    this.auth.register(fd).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err: unknown) => {
        const raw = (err as { error?: unknown })?.error;
        // Handle both { errors: string[] } and { errors: Record<string, string[]> }
        let msgs: string[] = [];
        if (raw && typeof raw === 'object') {
          const r = raw as Record<string, unknown>;
          if (Array.isArray(r['errors'])) {
            msgs = r['errors'] as string[];
          } else if (r['errors'] && typeof r['errors'] === 'object') {
            msgs = Object.values(r['errors'] as Record<string, string[]>).flat();
          } else if (typeof r['title'] === 'string') {
            msgs = [r['title']];
          }
        }
        this.errors.set(msgs.length ? msgs : ['Registration failed. Please try again.']);
        this.loading.set(false);
      },
    });
  }

  get f() { return this.form.controls; }
}
