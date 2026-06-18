import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'
import { URL } from 'url'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'image-proxy',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/image-proxy/')) {
            const targetUrl = decodeURIComponent(req.url.substring(13));
            if (!targetUrl.startsWith('http')) {
              res.statusCode = 400;
              res.end('Invalid URL');
              return;
            }

            try {
              const parsedUrl = new URL(targetUrl);
              const client = parsedUrl.protocol === 'https:' ? https : http;
              
              const options = {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              };

              const proxyReq = client.get(targetUrl, options, (proxyRes) => {
                res.writeHead(proxyRes.statusCode || 200, {
                  'Access-Control-Allow-Origin': '*',
                  'Content-Type': proxyRes.headers['content-type'] || 'image/jpeg',
                  'Cache-Control': 'public, max-age=86400'
                });
                proxyRes.pipe(res);
              });

              proxyReq.on('error', (err) => {
                console.error('Image proxy error:', err);
                res.statusCode = 500;
                res.end('Proxy Error');
              });
              return;
            } catch (err) {
              console.error('Invalid URL in proxy:', err);
              res.statusCode = 400;
              res.end('Invalid URL');
              return;
            }
          }
          next();
        });
      }
    }
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  }
})
