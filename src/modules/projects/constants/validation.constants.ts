import type { ValidationRule } from '@common/interfaces';
import { ProjectField } from '../enums';

export const projectValidationRules: Record<ProjectField, ValidationRule> = {
  [ProjectField.Name]: {
    minLength: 1,
    maxLength: 100,
  },
};
