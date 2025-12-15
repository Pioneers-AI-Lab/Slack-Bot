#!/usr/bin/env node

/**
 * Script to call the digest endpoint
 * Usage:
 *   node scripts/call-endpoint.js [daily|weekly] [url]
 * 
 * Examples:
 *   node scripts/call-endpoint.js daily
 *   node scripts/call-endpoint.js weekly http://localhost:3000
 *   node scripts/call-endpoint.js daily https://your-project.vercel.app
 */

const mode = process.argv[2] || 'daily';
// Get URL from: 1) command line arg, 2) VERCEL_URL env var, 3) default to localhost
const baseUrl = process.argv[3] || process.env.VERCEL_URL || 'http://localhost:3000';

if (mode !== 'daily' && mode !== 'weekly') {
    console.error('❌ Invalid mode. Use "daily" or "weekly"');
    console.error('   Usage: node scripts/call-endpoint.js [daily|weekly] [url]');
    process.exit(1);
}

const url = `${baseUrl}/api/digest?mode=${mode}`;

console.log(`📞 Calling endpoint: ${url}`);
console.log(`   Mode: ${mode}`);
console.log(`   Base URL: ${baseUrl}`);
console.log();

async function callEndpoint() {
    try {
        const startTime = Date.now();
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log();

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success!');
            console.log(JSON.stringify(data, null, 2));

            if (data.status === 'sent') {
                console.log();
                console.log(`   📅 Digest Type: ${data.digest_type}`);
                console.log(`   📋 Events: ${data.events_count}`);
                console.log(`   🎯 Milestones: ${data.milestones_count}`);
            }
        } else {
            console.error('❌ Error Response:');
            console.error(JSON.stringify(data, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Request failed:');
        console.error(`   ${error.message}`);

        if (error.code === 'ECONNREFUSED') {
            console.error();
            console.error('   💡 Tip: Make sure the server is running:');
            console.error('      npm run local');
        } else if (error.code === 'ENOTFOUND') {
            console.error();
            console.error('   💡 Tip: Check that the URL is correct');
        }

        process.exit(1);
    }
}

callEndpoint();

