import { z } from 'zod';
import { AuthMessages } from '../constants';

export const forgotPasswordSchema = z.object({
  email: z.email({ error: AuthMessages.invalidEmail() }),
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
