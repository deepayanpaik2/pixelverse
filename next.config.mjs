/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'https', hostname: 'img.gamepix.com' }, { protocol: 'https', hostname: 'images.unsplash.com' }] },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "frame-src 'self' https: http: blob: data:",
          "img-src 'self' data: blob: https:",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
          "style-src 'self' 'unsafe-inline' https:",
          "font-src 'self' data: https:",
          "connect-src 'self' https: wss: http:",
          "media-src 'self' blob: https: data:",
        ].join('; ') + ';',
      }],
    }];
  },
};
export default nextConfig;