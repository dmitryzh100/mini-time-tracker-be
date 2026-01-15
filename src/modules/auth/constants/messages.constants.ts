import { Messages } from '@common/constants';

const USER_ENTITY = 'User';

export const AuthMessages = {
  userNotFound: (): string => Messages.notFound(USER_ENTITY),

  userExists: (): string => Messages.duplicate('User with this email'),

  tokenRequired: (): string => Messages.required('Token'),

  passwordRequired: (): string => Messages.required('Password'),

  invalidEmail: (): string => Messages.invalid('email format'),

  invalidCredentials: (): string => 'Invalid email or password',

  invalidRefreshToken: (): string => 'Invalid refresh token',

  refreshTokenExpired: (): string => 'Refresh token expired',

  noRefreshToken: (): string => 'No refresh token provided',

  emailNotVerified: (): string => 'Please verify your email before logging in',

  verificationEmailSent: (): string =>
    'Verification email sent. Please check your inbox.',

  registrationSuccess: (): string =>
    'Registration successful! Please check your email to verify your account.',

  emailVerified: (): string => 'Email verified successfully.',

  passwordResetSent: (): string =>
    'If an account with this email exists, a password reset link has been sent.',

  passwordResetSuccess: (): string =>
    'Password reset successful. Please sign in with your new password.',

  invalidResetToken: (): string => 'Invalid or expired password reset token',

  invalidVerificationToken: (): string =>
    'Invalid or expired verification token',

  signedOut: (): string => 'Signed out successfully',

  resendVerificationSent: (): string =>
    'If an unverified account with this email exists, a verification link has been sent.',

  invalidTokenType: (): string => 'Invalid token type',

  authenticationRequired: (): string => 'Authentication required',

  passwordRegex: (): string =>
    'Password must contain at least one lowercase letter, one uppercase letter, and one number',
} as const;
