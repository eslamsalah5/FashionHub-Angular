import { User } from './user.model';

/** Matches the backend LoginDto */
export interface LoginDto {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

/** Matches the backend AuthResponseDto */
export interface AuthResponseDto {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  userType: number; // 0 = Admin, 1 = Customer
  token: string;
}

/** Wrapper returned by the API: { statusCode, message, data: AuthResponseDto } */
export interface AuthResponse {
  statusCode: number;
  message: string;
  data: AuthResponseDto;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ResetPasswordDto {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}
