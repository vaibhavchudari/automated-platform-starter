// TEST FIXTURE ONLY. Not the interviewer's original application.
const express = require('express');
const { createClient } = require('redis');
const app = express();
app.use(express.json());
const port = 8080;
let requests = 0, errors = 0, ready = true;
const redis = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
redis.on('error', () => { ready = false; });
redis.connect().then(() => { ready = true; }).catch(() => { ready = false; });
app.use((req,res,next) => { requests++; res.on('finish',()=>{ if(res.statusCode>=500) errors++; }); next(); });
app.get('/healthz', (_req,res) => res.status(200).send('ok\n'));
app.get('/readyz', (_req,res) => res.status(ready ? 200 : 503).send(ready ? 'ready\n' : 'not ready\n'));
app.get('/metrics', (_req,res) => res.type('text/plain').send(
  '# HELP mock_http_requests_total Total requests to mock API\n# TYPE mock_http_requests_total counter\nmock_http_requests_total '+requests+
  '\n# HELP mock_http_errors_total Total 5xx responses\n# TYPE mock_http_errors_total counter\nmock_http_errors_total '+errors+'\n'));
app.get('/', (_req,res) => res.json({message:'Platform test fixture', warning:'not the original application'}));
app.post('/jobs', async (req,res) => {
  try {
    if (!ready) return res.status(503).json({error:'redis unavailable'});
    const id = await redis.lPush('jobs', JSON.stringify({payload:req.body || {}, createdAt:Date.now()}));
    return res.status(202).json({queued:true, queueDepth:id});
  } catch (e) { return res.status(503).json({error:'queue unavailable'}); }
});
const server = app.listen(port, () => console.log(`mock API listening on ${port}`));
function shutdown() {
  ready = false;
  server.close(async () => { try { if(redis.isOpen) await redis.quit(); } catch {} process.exit(0); });
  setTimeout(() => process.exit(1), 65000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
