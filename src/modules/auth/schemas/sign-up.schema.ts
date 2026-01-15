import { z } from 'zod';
import { FieldNames, Messages, Validation } from '@common/constants';
import { UserField } from '@modules/users/enums';
import { AuthMessages, AuthRegex } from '../constants';

const rules = {
  email: Validation.user(UserField.Email),
  password: Validation.user(UserField.Password),
  firstName: Validation.user(UserField.FirstName),
  lastName: Validation.user(UserField.LastName),
};

const fields = {
  email: FieldNames.user(UserField.Email),
  password: FieldNames.user(UserField.Password),
  firstName: FieldNames.user(UserField.FirstName),
  lastName: FieldNames.user(UserField.LastName),
};

export const signUpSchema = z.object({
  email: z.email({ error: Messages.invalid(fields.email) }),
  password: z
    .string({ error: Messages.required(fields.password) })
    .min(rules.password.minLength!, {
      error: Messages.minLength(fields.password, rules.password.minLength!),
    })
    .max(rules.password.maxLength!, {
      error: Messages.maxLength(fields.password, rules.password.maxLength!),
    })
    .regex(AuthRegex.password, { error: AuthMessages.passwordRegex() }),
  firstName: z
    .string()
    .min(rules.firstName.minLength!)
    .max(rules.firstName.maxLength!)
    .optional(),
  lastName: z
    .string()
    .min(rules.lastName.minLength!)
    .max(rules.lastName.maxLength!)
    .optional(),
});

export type SignUpDto = z.infer<typeof signUpSchema>;
