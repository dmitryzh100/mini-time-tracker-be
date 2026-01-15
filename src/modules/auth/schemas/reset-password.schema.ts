import { z } from 'zod';
import { FieldNames, Messages, Validation } from '@common/constants';
import { UserField } from '@modules/users/enums';
import { AuthMessages, AuthRegex } from '../constants';

const rules = {
  password: Validation.user(UserField.Password),
};

const fields = {
  password: FieldNames.user(UserField.Password),
};

export const resetPasswordSchema = z.object({
  token: z.string().min(1, AuthMessages.tokenRequired()),
  password: z
    .string()
    .min(
      rules.password.minLength!,
      Messages.minLength(fields.password, rules.password.minLength!),
    )
    .regex(AuthRegex.password, AuthMessages.passwordRegex()),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
