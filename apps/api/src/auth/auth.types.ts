export type JwtPayload = {
  sub: string;
  kakaoId: string;
};

export type AuthUser = {
  id: string;
  kakaoId: string;
  nickname: string | null;
};
