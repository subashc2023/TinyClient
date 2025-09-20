export const ROUTES = {
  home: "/",
  login: "/auth/login",
  signup: "/auth/signup",
  verify: "/auth/verify",
  inviteAccept: "/auth/accept",
  workspace: "/workspace",
  settings: "/settings",
  admin: "/admin",
} as const;

export type RouteKey = keyof typeof ROUTES;
