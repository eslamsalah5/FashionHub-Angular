import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, AuthResponseDto, ChangePasswordDto, LoginDto, ResetPasswordDto } from '../models/auth.model';
import { User } from '../models/user.model';

const TOKEN_KEY = 'fashionhub_token';
const API_BASE  = '/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http       = inject(HttpClient);
  private readonly router     = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _currentUser = signal<User | null>(null);

  readonly currentUser     = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole        = computed(() => this._currentUser()?.role ?? null);

  constructor() {
    this.restoreSession();
  }

  // ── Session restoration ──────────────────────────────────────────────

  private restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    if (this.isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    // Decode user from JWT claims as fallback (no stored user object)
    const user = this.decodeUserFromToken(token);
    if (user) this._currentUser.set(user);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  /** Decode user from JWT claims — used only for session restoration */
  private decodeUserFromToken(token: string): User | null {
    try {
      const p = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
      const roleRaw = p['role'] ?? p['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const role = String(roleRaw ?? 'Customer') as 'Admin' | 'Customer';
      return {
        id:       String(p['nameid'] ?? p['sub'] ?? ''),
        email:    String(p['email'] ?? ''),
        fullName: String(p['unique_name'] ?? p['name'] ?? ''),
        role,
      };
    } catch {
      return null;
    }
  }

  /** Map AuthResponseDto (from login response) to our User model */
  private mapDtoToUser(dto: AuthResponseDto): User {
    // userType: 0 = Admin, 1 = Customer  (matches backend UserType enum)
    const role: 'Admin' | 'Customer' = dto.userType === 0 ? 'Admin' : 'Customer';
    return {
      id:       dto.id,
      email:    dto.email,
      fullName: dto.fullName,
      role,
    };
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Auth methods ─────────────────────────────────────────────────────

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/login`, credentials).pipe(
      tap(response => {
        const dto = response.data;
        if (dto?.token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem(TOKEN_KEY, dto.token);
          this._currentUser.set(this.mapDtoToUser(dto));
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  register(formData: FormData): Observable<unknown> {
    return this.http.post(`${API_BASE}/register-customer`, formData);
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.http.post(`${API_BASE}/forgot-password`, JSON.stringify(email), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  resetPassword(dto: ResetPasswordDto): Observable<unknown> {
    return this.http.post(`${API_BASE}/reset-password`, dto);
  }

  changePassword(dto: ChangePasswordDto): Observable<unknown> {
    return this.http.post(`${API_BASE}/change-password`, dto);
  }

  getMyProfile(): Observable<unknown> {
    return this.http.get(`${API_BASE}/my-profile`);
  }

  updateCustomer(formData: FormData): Observable<unknown> {
    return this.http.put(`${API_BASE}/update-customer`, formData);
  }

  updateAdmin(formData: FormData): Observable<unknown> {
    return this.http.put(`${API_BASE}/update-admin`, formData);
  }
}
