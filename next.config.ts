import type { NextConfig } from 'next';
import { realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, sep } from 'node:path';

// Include shared dependencies when this checkout uses a linked node_modules directory.
const dependencies = realpathSync(join(__dirname, 'node_modules'));
let workspaceRoot = __dirname;
while (true) {
  const dependencyPath = relative(workspaceRoot, dependencies);
  if (dependencyPath !== '..' && !dependencyPath.startsWith(`..${sep}`) && !isAbsolute(dependencyPath)) break;
  const parent = dirname(workspaceRoot);
  if (parent === workspaceRoot) break;
  workspaceRoot = parent;
}

const nextConfig: NextConfig = {
  turbopack: { root: workspaceRoot },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '200mb' },
  },
  // Allow large multipart/form-data bodies in Route Handlers (images, videos)
  serverExternalPackages: [],
};

export default nextConfig;
