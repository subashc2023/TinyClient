export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  verify: "/verify",
  inviteAccept: "/invite/accept",
  workspace: "/workspace",
  settings: "/settings",
  admin: "/admin",
} as const;

export type RouteKey = keyof typeof ROUTES;
