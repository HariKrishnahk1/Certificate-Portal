const API_BASE = import.meta.env.VITE_API_URL || '/api';
const isAppsScript = API_BASE.includes('script.google.com');

/**
 * Helper to construct a detailed error message with request details for debugging
 */
function makeDetailedError(message, url, method, response, responseText) {
  const statusStr = response ? `Status: ${response.status} ${response.statusText}` : 'Status: Connection Failed';
  const locationStr = typeof window !== 'undefined' ? `Browser Location: ${window.location.href}` : '';
  const textStr = responseText ? `Body: ${responseText.substring(0, 100)}` : 'Body: (empty)';
  
  return new Error(
    `${message}\n\n` +
    `[Diagnostics]\n` +
    `• URL: ${url}\n` +
    `• Method: ${method}\n` +
    `• ${statusStr}\n` +
    `• ${textStr}\n` +
    `• ${locationStr}`
  );
}

/**
 * Verifies email with the backend sheet database
 * @param {string} email 
 * @returns {Promise<object>}
 */
export async function verifyCertificate(email) {
  let response;
  let url = '';
  let method = '';

  try {
    if (isAppsScript) {
      method = 'GET';
      url = `${API_BASE}?email=${encodeURIComponent(email)}`;
      response = await fetch(url, { method, redirect: 'follow' });
    } else {
      method = 'POST';
      url = `${API_BASE}/verify-certificate`;
      
      // If relative API base, resolve to full URL for diagnostics
      if (url.startsWith('/')) {
        url = (typeof window !== 'undefined' ? window.location.origin : '') + url;
      }

      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    }
  } catch (netErr) {
    throw makeDetailedError(
      'Network error: Unable to connect to the server. Please check your internet connection.',
      url,
      method,
      null,
      netErr.message
    );
  }

  // Read response as plain text first
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Server error occurred during verification.';
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {}
    throw makeDetailedError(errorMessage, url, method, response, responseText);
  }

  try {
    return JSON.parse(responseText);
  } catch (jsonErr) {
    console.error('Failed to parse server response as JSON:', responseText);
    
    if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
      if (responseText.includes('Authorization is required') || responseText.includes('auth')) {
        throw makeDetailedError(
          'Access denied: Google Apps Script requires authorization. Please verify it is deployed to "Anyone".',
          url,
          method,
          response,
          responseText
        );
      }
      return makeDetailedError(
        'Server returned HTML instead of JSON.',
        url,
        method,
        response,
        responseText
      );
    }
    
    throw makeDetailedError(
      responseText ? 'Invalid JSON response received from the database server.' : 'Empty response received from the database server.',
      url,
      method,
      response,
      responseText
    );
  }
}

/**
 * Fetches the certificate PDF as a local blob URL for secure viewing
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

  const url = `${API_BASE}/download-certificate?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const responseText = await response.text();
    let errorMessage = 'Failed to download certificate.';
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {}
    throw makeDetailedError(errorMessage, url, 'GET', response, responseText);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Returns the download URL for direct download trigger
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
