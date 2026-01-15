import type { ValidationRule } from '@common/interfaces';
import { UserField } from '../enums';

export const userValidationRules: Record<UserField, ValidationRule> = {
  [UserField.Email]: {
    minLength: 5,
    maxLength: 255,
  },
  [UserField.Password]: {
    minLength: 8,
    maxLength: 128,
  },
  [UserField.FirstName]: {
    minLength: 1,
    maxLength: 50,
  },
  [UserField.LastName]: {
    minLength: 1,
    maxLength: 50,
  },
};
