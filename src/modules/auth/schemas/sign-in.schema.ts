import { z } from 'zod';
import { AuthMessages } from '../constants';

export const signInSchema = z.object({
  email: z.email({ error: AuthMessages.invalidEmail() }),
  password: z.string().min(1, { error: AuthMessages.passwordRequired() }),
});

export type SignInDto = z.infer<typeof signInSchema>;
