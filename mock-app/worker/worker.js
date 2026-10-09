// TEST FIXTURE ONLY. A minimal Redis list consumer for platform testing.
const { createClient } = require('redis');
const client = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
let stopping = false;
client.on('error', e => console.error('redis error', e.message));
async function main() {
  await client.connect();
  console.log('mock worker connected; waiting for jobs');
  while (!stopping) {
    const item = await client.brPop('jobs', 2);
    if (!item) continue;
    console.log('processing test job');
    // Simulate short work. Real jobs may run up to 60 seconds.
    await new Promise(r => setTimeout(r, 1000));
    console.log('test job completed');
  }
  await client.quit();
}
function stop() { stopping = true; console.log('shutdown requested; stop accepting new work'); }
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
main().catch(e => { console.error(e); process.exit(1); });
