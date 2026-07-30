import XLSX from 'xlsx';
import path from 'path';

const data = [
  ["Student Name", "Email ID", "Certificate File"],
  ["AYISHA SUHAINA S", "ayishasuhainaabdul@gmail.com", "AYISHA_SUHAINA_S.pdf"],
  ["HK", "harikrishnahk0221@gmail.com", "CERT-002.pdf"]
];

const worksheet = XLSX.utils.aoa_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

const destPath = path.join(process.cwd(), 'participants.xlsx');
XLSX.writeFile(workbook, destPath);
console.log('Created participants.xlsx file at:', destPath);
