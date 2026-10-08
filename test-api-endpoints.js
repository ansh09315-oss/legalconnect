// Test all authentication API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8888';

console.log('🧪 Testing Authentication API Endpoints\n');
console.log(`Base URL: ${API_BASE}/.netlify/functions/api\n`);

async function testEndpoints() {
  const results = [];

  // Test 1: Client Registration
  console.log('1️⃣ Testing Client Registration...');
  try {
    const res = await fetch(`${API_BASE}/.netlify/functions/api/auth/register-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Client',
        email: 'testclient@example.com',
        phone: '+91 9999999999',
        password: 'test123456'
      })
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, data);
    results.push({ endpoint: 'Client Registration', status: res.status, success: res.ok });
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    results.push({ endpoint: 'Client Registration', status: 'ERROR', success: false });
  }

  // Test 2: Client Login
  console.log('\n2️⃣ Testing Client Login...');
  try {
    const res = await fetch(`${API_BASE}/.netlify/functions/api/auth/login-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'testclient@example.com',
        password: 'test123456'
      })
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, data);
    results.push({ endpoint: 'Client Login', status: res.status, success: res.ok });
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    results.push({ endpoint: 'Client Login', status: 'ERROR', success: false });
  }

  // Test 3: Admin Login
  console.log('\n3️⃣ Testing Admin Login...');
  try {
    const res = await fetch(`${API_BASE}/.netlify/functions/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Ansh2015'
      })
    });
    const data = await res.json();
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, data);
    results.push({ endpoint: 'Admin Login', status: res.status, success: res.ok });
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    results.push({ endpoint: 'Admin Login', status: 'ERROR', success: false });
  }

  // Summary
  console.log('\n\n📊 Test Summary:');
  console.log('═══════════════════════════════════════');
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.endpoint}: ${r.status}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n${successCount}/${results.length} tests passed`);
}

testEndpoints().catch(console.error);
