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
  // Check for explicit API base URL first (backward compatibility)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.log(`🔧 Using explicit NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Build from unified config
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost";
  const protocol = process.env.NEXT_PUBLIC_APP_PROTOCOL || "http";
  const port = process.env.NEXT_PUBLIC_BACKEND_PORT || "8001";

  const builtUrl = buildUrl(domain, protocol, port);
  console.log(`🔧 Building API URL from env vars - domain: ${domain}, protocol: ${protocol}, port: ${port} -> ${builtUrl}`);

  return builtUrl;
}

export function getFrontendBaseUrl(): string {
  // Check for explicit frontend base URL first (backward compatibility)
  if (process.env.NEXT_PUBLIC_FRONTEND_BASE_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;
  }

  // Build from unified config
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost";
  const protocol = process.env.NEXT_PUBLIC_APP_PROTOCOL || "http";
  const port = process.env.NEXT_PUBLIC_FRONTEND_PORT || "3000";

  return buildUrl(domain, protocol, port);
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
