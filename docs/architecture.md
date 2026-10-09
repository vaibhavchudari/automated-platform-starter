# Architecture (draft; maximum five pages when formatted)

## Diagram
GitHub Actions (test/scan/build/sign) -> OCI registry (immutable digest) -> GitOps repository -> Argo CD -> Kubernetes -> API / worker -> PostgreSQL + Redis.
Prometheus/Grafana collect metrics and alert on SLO burn, errors, latency, queue age/depth, database saturation and rollout health.

## Decisions and rejected alternatives
1. **GitOps pull (Argo CD)** over long-lived pipeline push credentials: cluster reconciles reviewed desired state; requires GitOps controller and repository controls.
2. **API canary** over all-at-once deployment: limits blast radius and allows metric-based rollback; requires traffic routing and reliable metrics.
3. **Worker rolling update with drain** over instant replacement: jobs may run 60 seconds; graceful stop plus idempotent/retryable jobs reduces loss/duplication risk.
4. **Expand/contract database changes** over destructive one-step migration: supports mixed application versions; costs extra release cycles.
5. **Separate provider modules from platform/app** over one provider-specific monolith: improves reuse; managed service semantics still differ.
6. **Dedicated stacks for high-isolation tenants** over shared-only tenancy: stronger blast-radius and data separation; costs more.

## Top five risks
1. Unknown real app image/source and behavior; mock fixtures do not prove compatibility.
2. Non-backward-compatible startup migrations can break mixed-version rollouts.
3. Database connection exhaustion under autoscaling.
4. Autoscaler/node provisioning delay may exceed five minutes.
5. Cost, EU data residency, and failover claims need provider-specific validation and evidence.

## Not portable
Provider-specific IAM/workload identity, VPC/network primitives, load balancers, managed database/Redis features, KMS/secrets, object storage, DNS, regional availability, quotas, pricing, and backup APIs. Kubernetes/Helm are more portable but storage classes, ingress, identity and load balancer integration differ.
