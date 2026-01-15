export interface JwtPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
}

export interface JwtAccessPayload extends JwtPayload {
  type: 'access';
}

export interface JwtRefreshPayload extends JwtPayload {
  type: 'refresh';
  tokenId: string;
}
