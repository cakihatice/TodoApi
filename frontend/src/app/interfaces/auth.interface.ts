export interface LoginResponse {
  token: string;
  displayName: string;
}

export interface ProfileResponse {
  displayName: string;
  email: string;
  photoBase64: string | null;
  emailConfirmed: boolean;
}

export interface UpdateProfileRequest {
  email: string;
  photoBase64: string | null;
  newPassword: string | null;
  currentPassword: string | null;
}