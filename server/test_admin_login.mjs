import { config } from './src/config/env.js';
import http from 'http';

async function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {},
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body: body.toString() });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== Testing Admin Login ===');
  console.log('Config admin email:', config.admin.email);
  console.log('Config admin password:', config.admin.password ? '[SET]' : '(NOT SET)');

  const loginRes = await request('POST', '/api/v1/admin/login', {
    email: config.admin.email,
    password: config.admin.password,
  });
  console.log('\nLogin response status:', loginRes.status);
  console.log('Login response body:', JSON.stringify(loginRes.body, null, 2));
}

main().catch(e => console.error('Error:', e.message));
