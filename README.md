# Automated Platform Starter (PoC)

> IMPORTANT: `mock-app/` is a test fixture because the interviewer's application source/image was not supplied. It is NOT the original application. Replace its image references with the supplied, approved application images when available. Do not claim production SLOs or 15x capacity without test evidence.

## Quick start (Ubuntu)
1. Install Docker Engine, kubectl, kind, and Helm using their official installation instructions.
2. `docker build -t platform-api:dev ./mock-app/api`
3. `docker build -t platform-worker:dev ./mock-app/worker`
4. `kind create cluster --name platform`
5. `kind load docker-image platform-api:dev --name platform`
6. `kind load docker-image platform-worker:dev --name platform`
7. `kubectl apply -f k8s/local/`
8. `kubectl -n platform port-forward svc/api 8080:8080`
9. In another terminal: `curl -i http://127.0.0.1:8080/healthz`, `/readyz`, `/metrics`

The local manifests use simple PostgreSQL/Redis deployments for demonstration only. Do not use these database manifests in production.

## Contents
- `mock-app/`: clearly-labelled mock API/worker for testing the platform mechanics.
- `k8s/local/`: local Kubernetes manifests.
- `k8s/policies/`: PodDisruptionBudget and autoscaling examples.
- `.github/workflows/ci.yml`: basic CI workflow.
- `scripts/`: local smoke test and backup/restore examples.
- `docs/`: design notes, rollout gates, portability and roadmap.
- `infra/`: IaC layering starter notes (not a complete cloud provisioner).

## Status labels
- IMPLEMENTED IN STARTER: mock API/worker, local Kubernetes manifests, smoke test, sample CI.
- DESIGN ONLY: cloud account provisioning, remote state, managed database, GitOps promotion, multi-cloud provider adapters, SLO validation, EU policy enforcement, fleet rollout, cost validation.
