export interface CurrentUserData {
  id: number;
  email: string;
}

export interface RequestWithUser {
  user?: CurrentUserData;
}
