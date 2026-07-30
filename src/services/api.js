const API_BASE = import.meta.env.VITE_API_URL || '/api';
const isAppsScript = API_BASE.includes('script.google.com');

/**
 * Verifies email with the backend sheet database
 * @param {string} email 
 * @returns {Promise<object>}
 */
export async function verifyCertificate(email) {
  let response;
  try {
    if (isAppsScript) {
      // Perform GET request for Apps Script to avoid CORS pre-flight redirects issues
      const url = `${API_BASE}?email=${encodeURIComponent(email)}`;
      response = await fetch(url, { method: 'GET', redirect: 'follow' });
    } else {
      response = await fetch(`${API_BASE}/verify-certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    }
  } catch (netErr) {
    throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
  }

  // Read response as plain text first to safeguard against empty or HTML errors
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Server error occurred during verification.';
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  try {
    return JSON.parse(responseText);
  } catch (jsonErr) {
    console.error('Failed to parse server response as JSON:', responseText);
    
    // Provide diagnostic information to user if it's an HTML error page (e.g. Google auth/redirects/permissions)
    if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
      if (responseText.includes('Authorization is required') || responseText.includes('auth')) {
        throw new Error('Access denied: Google Apps Script requires authorization. Please verify it is deployed to "Anyone".');
      }
      throw new Error(`Server returned HTML instead of JSON. Details: ${responseText.substring(0, 80)}...`);
    }
    
    throw new Error(responseText ? `Invalid server response: ${responseText.substring(0, 100)}` : 'Empty response received from the database server.');
  }
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
    const responseText = await response.text();
    let errorMessage = 'Failed to download certificate.';
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
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
