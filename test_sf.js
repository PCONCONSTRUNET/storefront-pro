const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODExNDI2NDMsInN1YiI6IlF1RzJ4cmlITXdldXJZbVI1Q0hVdDA1eXh5ZjEifQ.TpxzJ_bMMFS7CconVPTzBpJh8cWZbPWujwrwuvrDac0';
const data = {
  from: { postal_code: '88735000' },
  to: { postal_code: '88750000' },
  services: '1,2',
  package: { weight: 0.3, width: 15, height: 15, length: 15 }
};

async function testURL(url) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'User-Agent': 'storefront-pro/1.0'
      },
      body: JSON.stringify(data)
    });
    const text = await res.text();
    console.log(`[${url}] Status: ${res.status}`);
    console.log(`[${url}] Body: ${text.substring(0, 200)}...`);
  } catch (err) {
    console.log(`[${url}] Error: ${err.message}`);
  }
}

async function run() {
  await testURL('https://app.superfrete.com/api/v2/calculator');
  await testURL('https://www.superfrete.com/api/v2/calculator');
  await testURL('https://api.superfrete.com/v2/calculator');
  await testURL('https://sandbox.superfrete.com/api/v2/calculator');
}
run();
