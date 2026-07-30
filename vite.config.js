import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import verifyCertificateHandler from './api/verify-certificate.js'
import downloadCertificateHandler from './api/download-certificate.js'

// Robust, defensive request body parser that prevents hanging if the stream is already read or closed
function parseRequestBody(req) {
  if (req.body !== undefined) {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve) => {
    if (req.readableEnded || !req.readable) {
      resolve({});
      return;
    }

    let body = '';
    
    // Safety timeout: If request hangs or 'end' event doesn't trigger in 1 second, resolve with whatever has been read
    const safetyTimeout = setTimeout(() => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    }, 1000);

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      clearTimeout(safetyTimeout);
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });

    req.on('error', () => {
      clearTimeout(safetyTimeout);
      resolve({});
    });
  });
}

// Helper to parse query parameters from URL
function parseUrlQuery(url) {
  const query = {};
  const parts = url.split('?');
  if (parts.length > 1) {
    const params = new URLSearchParams(parts[1]);
    for (const [key, value] of params.entries()) {
      query[key] = value;
    }
  }
  return query;
}

export default defineConfig({
  server: {
    watch: {
      ignored: [
        '**/private/**',
        '**/*.xlsx',
        '**/*.xls',
        '**/*.csv',
        '**/*.pdf',
        '**/.git/**'
      ]
    }
  },
  plugins: [
    react(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';
          
          // Match /api/verify-certificate
          if (url.startsWith('/api/verify-certificate')) {
            // Emulate Vercel's serverless req/res environment
            req.query = parseUrlQuery(url);
            if (req.method === 'POST') {
              req.body = await parseRequestBody(req);
            }
            
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            res.send = (data) => {
              res.end(data);
              return res;
            };

            try {
              await verifyCertificateHandler(req, res);
            } catch (err) {
              console.error('Error in Vite verify-certificate API:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          // Match /api/download-certificate
          if (url.startsWith('/api/download-certificate')) {
            req.query = parseUrlQuery(url);
            if (req.method === 'POST') {
              req.body = await parseRequestBody(req);
            }

            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            res.send = (data) => {
              res.end(data);
              return res;
            };

            try {
              await downloadCertificateHandler(req, res);
            } catch (err) {
              console.error('Error in Vite download-certificate API:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
            return;
          }

          next();
        });
      }
    }
  ],
})
