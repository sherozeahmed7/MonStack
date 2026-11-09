// Set this in Vercel's project environment, e.g. https://your-service.onrender.com.
// No database credentials or AI secrets belong in the frontend project.
const backend = process.env.BACKEND_ORIGIN;
if (!backend) throw new Error('Set BACKEND_ORIGIN to the Render HTTPS origin before deploying to Vercel.');
const origin = new URL(backend);
if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('BACKEND_ORIGIN must be an HTTPS origin without credentials, paths or query parameters.');
}

export const config = {
  framework: 'vite',
  installCommand: 'npm ci',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  rewrites: [
    { source: '/api/:path*', destination: `${origin.origin}/api/:path*` },
    { source: '/((?!api/).*)', destination: '/index.html' },
  ],
  headers: [
    { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
    { source: '/(.*)', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }] },
  ],
};
