import apiClient from './apiClient';

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface AuthResponse {
  jwtToken: string;
  message: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  passportNumber: string;
  nationality: string;
  profileImageUrl: string | null;
  createdAt: string;
  airlineId: string | null;
  airlineName: string | null;
  approvalStatus: string;
}

export interface ChangePasswordDTO {
  oldPassword?: string;
  newPassword?: string;
}

export const authApi = {
  login: (credentials: LoginDTO) => 
    apiClient.post<AuthResponse>('/auth/login', credentials),
  
  register: (userData: any) => 
    apiClient.post<AuthResponse>('/auth/register', userData),
  
  getProfile: () => 
    apiClient.get<UserProfile>('/auth/profile'),

  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.put<UserProfile>('/auth/profile', data),

  uploadProfileImage: (formData: FormData) =>
    apiClient.put<UserProfile>('/auth/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  changePassword: (data: ChangePasswordDTO) =>
    apiClient.post<any>('/auth/password', data),

  deactivateAccount: () =>
    apiClient.put<any>('/auth/deactivate'),
};
