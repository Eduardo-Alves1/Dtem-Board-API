export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  roles: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
