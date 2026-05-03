export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Customer';
  profileImageUrl?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}
