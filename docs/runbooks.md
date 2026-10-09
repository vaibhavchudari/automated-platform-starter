# Runbooks (starter)

## Bad canary
1. Stop promotion.
2. Route traffic back to stable version / abort rollout.
3. Check 5xx rate, p95 latency, readiness, pod events, logs, and dependency metrics.
4. Keep the failed image digest and logs for RCA.
5. Roll back application only if database schema remains compatible. Otherwise use a forward fix or restore plan.

## Queue backlog
1. Check Redis health, queue depth and oldest-job age.
2. Check worker replicas, CPU/memory, errors, and job duration.
3. Scale workers within database/Redis connection and throughput limits.
4. Verify retries and dead-letter handling; do not delete jobs to reduce backlog.

## Database restore
1. Declare incident and stop risky writes if needed.
2. Restore backup into isolated target.
3. Verify schema, row counts/checksums, and application connectivity.
4. Record RTO/RPO and obtain approval before cutover.
5. Run periodic restore tests; backup existence alone is not proof of recoverability.
