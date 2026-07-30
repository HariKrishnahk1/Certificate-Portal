import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // We support both GET (for simple downloads/previews in iframe) and POST
    const method = req.method;
    let email, certificate, signature, download;

    if (method === 'GET') {
      ({ email, certificate, signature, download } = req.query || {});
    } else if (method === 'POST') {
      ({ email, certificate, signature, download } = req.body || {});
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!email || !certificate || !signature) {
      return res.status(400).json({ error: 'Missing security parameters.' });
    }

    const targetEmail = email.trim().toLowerCase();
    const secret = process.env.APP_SECRET || 'fallback_development_secret';

    // Verify HMAC signature to prevent unauthorized path manipulation
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${targetEmail}:${certificate}`);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      return res.status(403).json({ error: 'Access denied: Invalid certificate signature.' });
    }

    // Check if certificate is a Google Drive URL
    const isGoogleDriveUrl = certificate.includes('drive.google.com') || certificate.includes('docs.google.com');
    if (isGoogleDriveUrl) {
      try {
        let fileId = '';
        // Extract Google Drive ID using regex
        const idRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
        const idMatch = certificate.match(idRegex);
        if (idMatch) {
          fileId = idMatch[1];
        } else {
          // Alternative query parameter extraction (e.g. ?id=...)
          const urlParts = certificate.split('?');
          if (urlParts.length > 1) {
            const urlParams = new URLSearchParams(urlParts[1]);
            fileId = urlParams.get('id') || '';
          }
        }

        if (fileId) {
          const driveDownloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
          const driveRes = await fetch(driveDownloadUrl);
          
          if (driveRes.ok) {
            const fileBuffer = await driveRes.arrayBuffer();
            
            // Retrieve name from database to format download filename
            let studentName = email.split('@')[0];
            const dbPath = path.join(process.cwd(), 'private', 'database.json');
            if (fs.existsSync(dbPath)) {
              try {
                const rawData = fs.readFileSync(dbPath, 'utf8');
                const participants = JSON.parse(rawData);
                const student = participants.find(p => p.email === targetEmail);
                if (student) {
                  studentName = student.name;
                }
              } catch (dbErr) {
                console.error('Error reading db in download API:', dbErr);
              }
            }
            
            const sanitizedName = studentName.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
            const downloadFilename = `${sanitizedName}_Certificate.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            if (download === 'true') {
              res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
            } else {
              res.setHeader('Content-Disposition', `inline; filename="${downloadFilename}"`);
            }
            
            return res.send(Buffer.from(fileBuffer));
          } else {
            console.error(`Google Drive fetch failed with status: ${driveRes.status}`);
          }
        }
      } catch (driveErr) {
        console.error('Failed to stream certificate from Google Drive:', driveErr.message);
      }
    }

    // Clean up path to prevent directory traversal
    const safeCertificateFilename = path.basename(certificate);
    
    // Check local filesystem private directory first
    const localFilePath = path.join(process.cwd(), 'private', 'certificates', safeCertificateFilename);

    if (fs.existsSync(localFilePath)) {
      const fileBuffer = fs.readFileSync(localFilePath);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      if (download === 'true') {
        res.setHeader('Content-Disposition', `attachment; filename="${safeCertificateFilename}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${safeCertificateFilename}"`);
      }
      
      return res.send(fileBuffer);
    }

    // Fallback: Firebase Storage Integration (If storage bucket details are configured)
    const firebaseBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
    if (firebaseBucket) {
      try {
        // Construct standard Firebase Storage API download URL
        // If the Firebase Storage Rules allow read access for this path:
        // certificates/CERT-001.pdf -> URL format: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/certificates%2F<file>?alt=media
        const firebaseStorageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o/certificates%2F${encodeURIComponent(safeCertificateFilename)}?alt=media`;
        
        const firebaseRes = await fetch(firebaseStorageUrl);
        if (firebaseRes.ok) {
          const fileBuffer = await firebaseRes.arrayBuffer();
          res.setHeader('Content-Type', 'application/pdf');
          if (download === 'true') {
            res.setHeader('Content-Disposition', `attachment; filename="${safeCertificateFilename}"`);
          } else {
            res.setHeader('Content-Disposition', `inline; filename="${safeCertificateFilename}"`);
          }
          return res.send(Buffer.from(fileBuffer));
        } else {
          console.error(`Firebase storage fetch returned status ${firebaseRes.status}`);
        }
      } catch (fbErr) {
        console.error('Failed to fetch from Firebase Storage:', fbErr.message);
      }
    }

    return res.status(404).json({ error: 'Certificate file not found on server.' });

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ error: 'Server error during certificate generation.' });
  }
}
