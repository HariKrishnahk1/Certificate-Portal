const API_BASE = import.meta.env.VITE_API_URL || '/api';
const isAppsScript = API_BASE.includes('script.google.com');

/**
 * Verifies email with the backend sheet database
 * @param {string} email 
 * @returns {Promise<object>}
 */
export async function verifyCertificate(email) {
  if (isAppsScript) {
    // Perform GET request for Apps Script to avoid CORS pre-flight redirects issues
    const url = `${API_BASE}?email=${encodeURIComponent(email)}`;
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!response.ok) {
      throw new Error('Verification failed. Unable to connect to database.');
    }
    return response.json();
  }

  const response = await fetch(`${API_BASE}/verify-certificate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Server error occurred during verification.');
  }

  return response.json();
}

/**
 * Fetches the certificate PDF as a local blob URL for secure viewing
 * @param {string} email 
 * @param {string} certificate 
 * @param {string} signature 
 * @returns {Promise<string>} Blob URL or direct URL
 */
export async function getCertificateBlobUrl(email, certificate, signature) {
  if (isAppsScript) {
    // For Apps Script mode, if the certificate is a Google Drive URL, return the preview player embed link
    const googleDriveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = certificate.match(googleDriveRegex);
    if (match) {
      const fileId = match[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return certificate;
  }

  const queryParams = new URLSearchParams({
    email,
    certificate,
    signature,
    download: 'false'
  });

  const response = await fetch(`${API_BASE}/download-certificate?${queryParams.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to download certificate.');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Returns the download URL for direct download trigger
 * @param {string} email 
 * @param {string} certificate 
 * @param {string} signature 
 * @returns {string} Fully qualified download link
 */
export function getCertificateDownloadUrl(email, certificate, signature) {
  if (isAppsScript) {
    const googleDriveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = certificate.match(googleDriveRegex);
    if (match) {
      const fileId = match[1];
      return `https://docs.google.com/uc?export=download&id=${fileId}`;
    }
    return certificate;
  }

  const queryParams = new URLSearchParams({
    email,
    certificate,
    signature,
    download: 'true'
  });
  return `${API_BASE}/download-certificate?${queryParams.toString()}`;
}
