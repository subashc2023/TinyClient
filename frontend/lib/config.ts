export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";
}

export function getDocsUrl(): string {
  return `${getApiBaseUrl()}/docs`;
}

function normalizeFlag(value: string | undefined | null): string {
  return value?.trim().toLowerCase() ?? "";
}

const rawAllowSignup =
  normalizeFlag(process.env.NEXT_PUBLIC_ALLOW_SIGNUP) ||
  normalizeFlag(process.env.ALLOW_SIGNUP) ||
  "false";

export const allowSignup = ["1", "true", "yes", "on"].includes(rawAllowSignup);

const projectName =
  process.env.NEXT_PUBLIC_PROJECT_NAME ||
  process.env.PROJECT_NAME ||
  "TinyClient";

export function getProjectName(): string {
  return projectName;
}
