export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  isEmailVerified?: boolean;
  emailVerifiedAt?: Date;
}
