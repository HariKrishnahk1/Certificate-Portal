const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Verifies email with the backend sheet database
 * @param {string} email 
 * @returns {Promise<object>}
 */
export async function verifyCertificate(email) {
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
 * @returns {Promise<string>} Blob URL
 */
export async function getCertificateBlobUrl(email, certificate, signature) {
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
  const queryParams = new URLSearchParams({
    email,
    certificate,
    signature,
    download: 'true'
  });
  return `${API_BASE}/download-certificate?${queryParams.toString()}`;
}
