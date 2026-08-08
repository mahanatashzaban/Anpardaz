const fetch = require('node-fetch');

const apiKey = '3876794761642F4E4566617A634B386D5735396E485A653275513341446773644D4171677134724358476B3D';
const phone = '09375437106';  // Replace with your test phone number
const code = '12345';
const template = 'template';  // Your template name

async function testKavenegar() {
  try {
    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;
    const body = new URLSearchParams({
      receptor: phone,
      token: code,
      template: template
    });

    console.log('📤 Sending request to Kavenegar...');
    const response = await fetch(url, { method: 'POST', body });
    const data = await response.json();
    
    console.log('📥 Response:', JSON.stringify(data, null, 2));
    
    if (data.return && data.return.status === 200) {
      console.log('✅ Kavenegar test successful!');
      console.log('📱 SMS sent to:', phone);
      console.log('📝 Message contains code:', code);
    } else {
      console.error('❌ Kavenegar test failed:');
      console.error('Status:', data.return?.status);
      console.error('Message:', data.return?.message);
    }
  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

testKavenegar();
