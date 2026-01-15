import { z } from 'zod';

import { Messages } from '@common/constants';

const REFRESH_TOKEN_FIELD = 'Refresh token';

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, { error: Messages.required(REFRESH_TOKEN_FIELD) }),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
