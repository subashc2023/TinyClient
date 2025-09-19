function buildUrl(domain: string, protocol: string, port: string): string {
  const normalizedProtocol = protocol || "http";
  const normalizedDomain = domain || "localhost";

  // Handle default ports
  if ((normalizedProtocol === "http" && port === "80") ||
      (normalizedProtocol === "https" && port === "443")) {
    return `${normalizedProtocol}://${normalizedDomain}`;
  }

  return port ? `${normalizedProtocol}://${normalizedDomain}:${port}` : `${normalizedProtocol}://${normalizedDomain}`;
}

export function getApiBaseUrl(): string {
  // Build from unified config only
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost";
  const protocol = process.env.NEXT_PUBLIC_APP_PROTOCOL || "http";
  const port = process.env.NEXT_PUBLIC_BACKEND_PORT || "8001";

  const builtUrl = buildUrl(domain, protocol, port);
  console.log(`🔧 Building API URL from env vars - domain: ${domain}, protocol: ${protocol}, port: ${port} -> ${builtUrl}`);

  return builtUrl;
}

export function getFrontendBaseUrl(): string {
  // Build from unified config only
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost";
  const protocol = process.env.NEXT_PUBLIC_APP_PROTOCOL || "http";
  const port = process.env.NEXT_PUBLIC_FRONTEND_PORT || "3000";

  return buildUrl(domain, protocol, port);
}

export function getPasswordPolicy() {
  const minLength = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN_LENGTH || 12);
  const requireLower = (process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_LOWER || "true").toLowerCase() !== "false";
  const requireUpper = (process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPER || "true").toLowerCase() !== "false";
  const requireDigit = (process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_DIGIT || "true").toLowerCase() !== "false";
  const requireSymbol = (process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SYMBOL || "true").toLowerCase() !== "false";
  return { minLength, requireLower, requireUpper, requireDigit, requireSymbol };
}

export function getDocsUrl(): string {
  const apiBaseUrl = getApiBaseUrl();
  const docsUrl = `${apiBaseUrl}/docs`;
  console.log(`🔧 getDocsUrl() - apiBaseUrl: ${apiBaseUrl}, docsUrl: ${docsUrl}`);
  return docsUrl;
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
