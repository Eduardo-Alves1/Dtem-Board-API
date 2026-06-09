import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  reactStrictMode: true,
  transpilePackages: ['@dtem-board/shared'],
};

export default nextConfig;
