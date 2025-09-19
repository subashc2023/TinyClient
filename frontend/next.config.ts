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
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot', '@radix-ui/react-toggle'],
  },
  compress: true,
  poweredByHeader: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Fix Cross-Origin warning
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Allow development origins
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['104.225.217.226'],
  }),
};

export default nextConfig;
