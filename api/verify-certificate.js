import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CSV parser
function parseCSV(csvString) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    const nextChar = csvString[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentLine.push(currentVal.trim());
      if (currentLine.length > 0 && currentLine.some(val => val !== '')) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal !== '' || currentLine.length > 0) {
    currentLine.push(currentVal.trim());
    lines.push(currentLine);
  }
  return lines;
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Please enter your registered email.' });
    }

    const targetEmail = email.trim().toLowerCase();
    const secret = process.env.APP_SECRET || 'fallback_development_secret';

    let participants = [];
    const dbPath = path.join(process.cwd(), 'private', 'database.json');
    const mockDbPath = path.join(process.cwd(), 'private', 'mock_database.json');

    if (fs.existsSync(dbPath)) {
      const rawData = fs.readFileSync(dbPath, 'utf8');
      participants = JSON.parse(rawData);
    } else if (fs.existsSync(mockDbPath)) {
      // Fallback to dev mockup if import hasn't run yet
      const rawData = fs.readFileSync(mockDbPath, 'utf8');
      participants = JSON.parse(rawData);
    } else {
      return res.status(500).json({ error: 'Server error: Local database not initialized.' });
    }

    // Find the participant
    const student = participants.find(p => p.email === targetEmail);

    if (!student) {
      return res.status(200).json({ found: false });
    }

    if (!student.certificate) {
      return res.status(200).json({
        found: true,
        name: student.name,
        error: 'Your participation was found, but your certificate is not available yet.'
      });
    }

    // Generate secure cryptographic HMAC signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${student.email}:${student.certificate}`);
    const signature = hmac.digest('hex');

    return res.status(200).json({
      found: true,
      name: student.name,
      certificate: student.certificate,
      signature: signature
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Something went wrong while checking your certificate. Please try again.' });
  }
}
