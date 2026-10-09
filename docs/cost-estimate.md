# Cost estimate — not a quote

The assignment's $9,000 steady / $16,000 peak budgets are constraints, not validated estimates. Do not invent a precise AWS total before selecting region, instance sizes, storage, retention, egress, tenant count, and managed-service tiers.

Estimate by line item using the AWS Pricing Calculator:
- EKS control plane and worker nodes
- Load balancers, NAT gateways, cross-AZ and internet egress
- PostgreSQL/RDS instances, storage, IOPS, backups, replicas
- Redis/ElastiCache nodes, storage and data transfer
- ECR storage and data transfer
- CloudWatch logs/metrics, KMS, Secrets Manager
- S3 backups and retention
- Dedicated tenant baseline and peak headroom

Peak estimate must include temporary node capacity, database scaling and data transfer. Set budgets/alerts and test load before claiming compliance.
