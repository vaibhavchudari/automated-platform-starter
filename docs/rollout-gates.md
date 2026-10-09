# Rollout and scaling gates (design targets, not tested claims)

## API canary
Traffic steps: 5% -> 25% -> 50% -> 100%; observe each step for at least 10 minutes and enough request volume.
Promote only when: p95 < 400 ms; 5xx rate < 0.5%; readiness failures = 0; no sustained CPU throttling; database pool wait and saturation within limits.
Abort/rollback when any hard threshold is breached for 2 consecutive windows. Tune thresholds to baseline and error budget.

## Worker
Rolling update with maxUnavailable=0 where capacity allows. On SIGTERM stop claiming jobs, finish current job within 60 seconds, then exit; if interrupted, job must be safely retried (visibility timeout/ack after success, idempotency key). Monitor queue depth, oldest-job age, job failures and processing time.

## Autoscaling math
Peak API rate = 2,250 req/s; baseline = 150 req/s. This is 15x.
If a load test proves one API pod safely handles C requests/s at the latency target, theoretical pods = ceil(2250/C). Add at least 30% headroom: ceil(2250/C * 1.3). Do not guess C; measure it.
Jobs/hour = 20,000 => average arrival rate = 20,000/3,600 = 5.56 jobs/s. If mean service time is 60s, concurrency required at average rate is ~334 concurrent jobs before headroom. Real mean job time may be lower; size using measured distribution and queue-age SLO.
Database connections: max app connections must be <= database max connections minus reserved/admin capacity. Budget across all pods: replicas * pool_size <= connection budget; use PgBouncer if appropriate. Autoscaling API without connection limits can overload PostgreSQL.
