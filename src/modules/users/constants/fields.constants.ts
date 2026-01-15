import { UserField } from '../enums';

export const userFieldNames: Record<UserField, string> = {
  [UserField.Email]: 'Email',
  [UserField.Password]: 'Password',
  [UserField.FirstName]: 'First name',
  [UserField.LastName]: 'Last name',
};
