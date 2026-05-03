import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile-view',
  imports: [RouterLink, DatePipe],
  template: `
    <main class="profile-page">
      <div class="profile-page__header">
        <h1 class="profile-page__title">My Profile</h1>
        <a routerLink="/profile/edit" class="btn btn-primary">Edit Profile</a>
      </div>

      @if (loading()) {
        <div class="profile-card" aria-busy="true">
          <div class="skeleton" style="width: 96px; height: 96px; border-radius: 50%;"></div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; margin-top: 16px;">
            <div class="skeleton" style="height: 28px; width: 50%;"></div>
            <div class="skeleton" style="height: 20px; width: 20%;"></div>
          </div>
          <div style="width: 100%; margin-top: 24px; display: flex; flex-direction: column; gap: 16px;">
            <div class="skeleton" style="height: 40px; width: 100%;"></div>
            <div class="skeleton" style="height: 40px; width: 100%;"></div>
            <div class="skeleton" style="height: 40px; width: 100%;"></div>
          </div>
          <div class="skeleton" style="height: 40px; width: 150px; margin-top: 16px;"></div>
        </div>
      } @else if (user(); as u) {
        <div class="profile-card">
          @if (u.profileImageUrl) {
            <img [src]="u.profileImageUrl" [alt]="u.fullName + ' profile picture'" class="profile-card__avatar" width="96" height="96" />
          } @else {
            <div class="profile-card__avatar-placeholder" aria-hidden="true">{{ u.fullName.charAt(0) }}</div>
          }
          <div class="profile-card__info">
            <h2 class="profile-card__name">{{ u.fullName }}</h2>
            <span class="badge badge-success">{{ u.role }}</span>
          </div>
          <dl class="profile-card__details">
            <div class="profile-detail">
              <dt class="profile-detail__label">Email</dt>
              <dd class="profile-detail__value">{{ u.email }}</dd>
            </div>
            @if (u.phoneNumber) {
              <div class="profile-detail">
                <dt class="profile-detail__label">Phone</dt>
                <dd class="profile-detail__value">{{ u.phoneNumber }}</dd>
              </div>
            }
            @if (u.address) {
              <div class="profile-detail">
                <dt class="profile-detail__label">Address</dt>
                <dd class="profile-detail__value">{{ u.address }}</dd>
              </div>
            }
            @if (u.dateOfBirth) {
              <div class="profile-detail">
                <dt class="profile-detail__label">Date of Birth</dt>
                <dd class="profile-detail__value">{{ u.dateOfBirth | date:'longDate' }}</dd>
              </div>
            }
          </dl>
          <a routerLink="/profile/change-password" class="btn btn-secondary">Change Password</a>
        </div>
      }
    </main>
  `,
  styles: [`
    .profile-page { max-width: 640px; margin-inline: auto; padding: var(--space-8) var(--space-4); }
    .profile-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
    .profile-page__title { font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-text); }
    .profile-card { background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-8); display: flex; flex-direction: column; gap: var(--space-6); align-items: center; }
    .profile-card__avatar { width: 96px; height: 96px; border-radius: var(--radius-full); object-fit: cover; border: 3px solid var(--color-primary-200); }
    .profile-card__avatar-placeholder { width: 96px; height: 96px; border-radius: var(--radius-full); background-color: var(--color-primary-500); color: var(--color-text-inverse); display: flex; align-items: center; justify-content: center; font-size: var(--font-size-3xl); font-weight: 700; }
    .profile-card__info { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
    .profile-card__name { font-size: var(--font-size-2xl); font-weight: 700; color: var(--color-text); }
    .profile-card__details { width: 100%; display: flex; flex-direction: column; gap: var(--space-3); }
    .profile-detail { display: flex; justify-content: space-between; padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border); }
    .profile-detail:last-child { border-bottom: none; }
    .profile-detail__label { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-muted); }
    .profile-detail__value { font-size: var(--font-size-sm); color: var(--color-text); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileViewComponent {
  private readonly profileService = inject(ProfileService);

  readonly loading = signal(true);
  readonly user    = signal<User | null>(null);

  constructor() {
    this.profileService.getMyProfile().subscribe({
      next: u => { this.user.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
