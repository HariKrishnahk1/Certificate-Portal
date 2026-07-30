import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Helper to parse CSV manually if a CSV file is used
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

function runImport() {
  const workspaceRoot = process.cwd();
  
  // Define possible input paths
  const fileOptions = [
    'Certificate.xlsx',
    'certificate.xlsx',
    'Certificate.xls',
    'certificate.xls',
    'Certificate.csv',
    'certificate.csv',
    'participants.xlsx',
    'participants.xls',
    'participants.csv'
  ];
  
  let rows = [];
  let sourceFile = '';
  let foundPath = '';

  for (const file of fileOptions) {
    const fullPath = path.join(workspaceRoot, file);
    if (fs.existsSync(fullPath)) {
      sourceFile = file;
      foundPath = fullPath;
      break;
    }
  }

  if (!foundPath) {
    console.error('ERROR: No participant spreadsheet found. Please place your Excel sheet (e.g., "Certificate.xlsx") in the root directory.');
    process.exit(1);
  }

  console.log(`Loading Excel sheet from: ${sourceFile}`);
  
  if (sourceFile.endsWith('.csv')) {
    const csvContent = fs.readFileSync(foundPath, 'utf8');
    rows = parseCSV(csvContent);
  } else {
    const workbook = XLSX.readFile(foundPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  }

  if (rows.length < 2) {
    console.error('ERROR: Sheet contains no data or headers. Found row count:', rows.length);
    process.exit(1);
  }

  // Find column indexes dynamically
  const headers = rows[0].map(h => String(h || '').toLowerCase().trim());
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student') || h.includes('participant'));
  const certIdx = headers.findIndex(h => h.includes('certificate') || h.includes('cert'));

  if (emailIdx === -1 || nameIdx === -1 || certIdx === -1) {
    console.error('ERROR: Headers did not match schema. Expected headers to contain variations of "Name", "Email", and "Certificate".');
    console.log('Headers found:', rows[0]);
    process.exit(1);
  }

  console.log(`Headers mapped: Name -> col ${nameIdx}, Email -> col ${emailIdx}, Certificate -> col ${certIdx}`);

  // Transform rows to JSON records
  const participants = [];
  const processedEmails = new Set();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawName = row[nameIdx];
    const rawEmail = row[emailIdx];
    const rawCert = row[certIdx];

    if (!rawEmail || !rawName) {
      // Skip incomplete rows
      continue;
    }

    const emailStr = String(rawEmail).trim().toLowerCase();
    const nameStr = String(rawName).trim();
    const certStr = String(rawCert || '').trim();

    if (processedEmails.has(emailStr)) {
      console.warn(`Warning: Duplicate email found at row ${i + 1} (${emailStr}). Keeping first occurrence.`);
      continue;
    }

    processedEmails.add(emailStr);
    participants.push({
      name: nameStr,
      email: emailStr,
      certificate: certStr
    });
  }

  // Save to private database
  const privateDir = path.join(workspaceRoot, 'private');
  if (!fs.existsSync(privateDir)) {
    fs.mkdirSync(privateDir, { recursive: true });
  }

  const dbPath = path.join(privateDir, 'database.json');
  fs.writeFileSync(dbPath, JSON.stringify(participants, null, 2), 'utf8');

  console.log(`SUCCESS: Imported ${participants.length} participant records from ${sourceFile} into: private/database.json`);
}

runImport();
