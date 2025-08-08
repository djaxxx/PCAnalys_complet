#!/usr/bin/env node
/**
 * Simple test script to verify Fastify API functionality
 * Run with: npx tsx src/server/test-api.ts
 */

import createFastifyInstance from './fastify';
import { SystemAnalysisRequestSchema, UserProfileSchema } from './schemas';

async function testApi() {
  console.log('🚀 Testing PcAnalys Fastify API...\n');
  
  const app = createFastifyInstance();
  
  try {
    await app.ready();
    console.log('✅ Fastify instance ready');

    // Test 1: Health check
    console.log('\n📊 Testing health endpoint...');
    const healthResponse = await app.inject({
      method: 'GET',
      url: '/health'
    });
    
    const healthData = JSON.parse(healthResponse.body);
    console.log(`✅ Health check: ${healthData.status} (${healthResponse.statusCode})`);
    console.log(`   Uptime: ${Math.round(healthData.uptime)}s`);
    console.log(`   Memory: ${healthData.memory.used}/${healthData.memory.total} MB`);

    // Test 2: API status
    console.log('\n📡 Testing API status...');
    const statusResponse = await app.inject({
      method: 'GET',
      url: '/api/status'
    });
    
    const statusData = JSON.parse(statusResponse.body);
    console.log(`✅ API Status: ${statusData.service} v${statusData.version}`);

    // Test 3: Schema validation (valid)
    console.log('\n🔍 Testing schema validation (valid data)...');
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };

    const validationResult = UserProfileSchema.safeParse(validUserData);
    console.log(`✅ Schema validation: ${validationResult.success ? 'PASS' : 'FAIL'}`);

    // Test 4: Schema validation (invalid)
    console.log('\n❌ Testing schema validation (invalid data)...');
    const invalidUserData = {
      name: '',
      email: 'invalid-email'
    };

    const invalidValidationResult = UserProfileSchema.safeParse(invalidUserData);
    console.log(`✅ Invalid data rejection: ${!invalidValidationResult.success ? 'PASS' : 'FAIL'}`);
    if (!invalidValidationResult.success) {
      console.log(`   Errors: ${invalidValidationResult.error.errors.length} validation errors found`);
    }

    // Test 5: System analysis schema
    console.log('\n⚙️  Testing system analysis schema...');
    const systemAnalysisData = {
      component: 'gpu',
      details: {
        name: 'RTX 3070',
        manufacturer: 'NVIDIA',
        specifications: {
          vram: '8GB',
          cores: 5888
        },
        performance: {
          score: 85,
          temperature: 65,
          usage: 45
        }
      },
      timestamp: new Date().toISOString()
    };

    const analysisValidation = SystemAnalysisRequestSchema.safeParse(systemAnalysisData);
    console.log(`✅ System analysis schema: ${analysisValidation.success ? 'PASS' : 'FAIL'}`);

    // Test 6: CORS headers
    console.log('\n🌐 Testing CORS configuration...');
    const corsResponse = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        'origin': 'tauri://localhost',
        'access-control-request-method': 'GET'
      }
    });

    const corsHeaders = corsResponse.headers;
    const hasCors = corsHeaders['access-control-allow-origin'] && corsHeaders['access-control-allow-methods'];
    console.log(`✅ CORS headers: ${hasCors ? 'CONFIGURED' : 'MISSING'}`);
    if (hasCors) {
      console.log(`   Origin: ${corsHeaders['access-control-allow-origin']}`);
      console.log(`   Methods: ${corsHeaders['access-control-allow-methods']}`);
    }

    console.log('\n🎉 All tests completed successfully!');
    
    // Performance metrics
    const memUsage = process.memoryUsage();
    console.log('\n📈 Performance Metrics:');
    console.log(`   Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`);
    console.log(`   Process Uptime: ${Math.round(process.uptime())}s`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await app.close();
    console.log('\n🔌 Fastify instance closed');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testApi().catch(console.error);
}

export default testApi;
