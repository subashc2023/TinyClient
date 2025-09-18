export const ROUTES = {
  home: "/",
  login: "/login",
  workspace: "/workspace",
  settings: "/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;


