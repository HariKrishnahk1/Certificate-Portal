// Node.js 18+ has native fetch, no import required!

async function runTests() {
  const url = 'http://localhost:5173/api/verify-certificate';
  
  const testEmails = [
    'ayishasuhainaabdul@gmail.com', // Exists
    'nonexistent@gmail.com',       // Doesn't exist
    '   AYISHASUHAINAABDUL@GMAIL.COM  ' // Needs normalization
  ];

  for (const email of testEmails) {
    try {
      console.log(`\nTesting email: "${email}"`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log(`Status Code: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.log(`Response Content: "${text}"`);
    } catch (err) {
      console.error(`Fetch failed for "${email}":`, err.message);
    }
  }
}

runTests();
