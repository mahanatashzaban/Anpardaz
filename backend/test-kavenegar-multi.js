const fetch = require('node-fetch');

const apiKey = '3876794761642F4E4566617A634B386D5735396E485A653275513341446773644D4171677134724358476B3D';
const template = 'template';

// Test multiple phone numbers
const testNumbers = [
  '09375437106',  // Your working number
  '09123456789',  // Test another number
];

async function testKavenegar(phone) {
  try {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;
    const body = new URLSearchParams({
      receptor: phone,
      token: code,
      template: template
    });

    console.log(`📤 Testing Kavenegar for: ${phone}`);
    const response = await fetch(url, { method: 'POST', body });
    const data = await response.json();
    
    if (data.return && data.return.status === 200) {
      console.log(`✅ SMS sent to: ${phone} (Code: ${code})`);
      return true;
    } else {
      console.error(`❌ Failed for ${phone}:`, data.return?.message);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error for ${phone}:`, err.message);
    return false;
  }
}

async function testAll() {
  console.log('=== Testing Kavenegar for Multiple Numbers ===\n');
  for (const phone of testNumbers) {
    await testKavenegar(phone);
    await new Promise(r => setTimeout(r, 1000));
  }
}

testAll();
