export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";
}

export function getDocsUrl(): string {
  return `${getApiBaseUrl()}/docs`;
}


