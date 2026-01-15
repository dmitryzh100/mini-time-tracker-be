export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends TokenResponse {
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isEmailVerified: boolean;
  };
}
