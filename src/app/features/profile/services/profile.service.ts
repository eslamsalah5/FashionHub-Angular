import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { ChangePasswordDto } from '../../../core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  getMyProfile(): Observable<User> {
    return this.http.get<User>('/api/auth/my-profile');
  }

  updateCustomer(formData: FormData): Observable<unknown> {
    return this.http.put('/api/auth/update-customer', formData);
  }

  updateAdmin(formData: FormData): Observable<unknown> {
    return this.http.put('/api/auth/update-admin', formData);
  }

  changePassword(dto: ChangePasswordDto): Observable<unknown> {
    return this.http.post('/api/auth/change-password', dto);
  }
}
