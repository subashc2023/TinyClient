import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

function loadEnv(relativePath: string) {
  const fullPath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const fileContents = fs.readFileSync(fullPath, "utf-8");
  const lines = fileContents.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }
    const key = line.slice(0, equalsIndex).trim();
    if (!key || key.startsWith("#")) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }
    const rawValue = line.slice(equalsIndex + 1).trim();
    const unquotedValue = rawValue.replace(/^['"]|['"]$/g, "");
    process.env[key] = unquotedValue;
  }
}

[".env.local", ".env", "../.env"].forEach(loadEnv);

const defaultProjectName = process.env.PROJECT_NAME || "TinyClient";
const resolvedProjectName = process.env.NEXT_PUBLIC_PROJECT_NAME || defaultProjectName;

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PROJECT_NAME: resolvedProjectName,
  },
};

export default nextConfig;
