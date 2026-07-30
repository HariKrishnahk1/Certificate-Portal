import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import verifyCertificateHandler from './api/verify-certificate.js';
import downloadCertificateHandler from './api/download-certificate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backend API Routes
app.post('/api/verify-certificate', verifyCertificateHandler);
app.get('/api/download-certificate', downloadCertificateHandler);
app.post('/api/download-certificate', downloadCertificateHandler);

// Serve static assets compiled by Vite from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback: Serve index.html for all other routing paths (enables React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
