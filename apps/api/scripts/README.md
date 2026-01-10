# API Scripts

## Staging E2E Test Data Management

### Seed Staging Data

Creates test data for E2E booking flow verification in staging environment.

**What it creates:**
- 1 test user (provider): `+97333000001`
- 1 service provider: `__E2E__ Test Services`
- 5 services (mix of HOME, PERSONAL, PROFESSIONAL categories)
- Availability rules (Mon-Fri 9am-5pm)

**Usage:**

```bash
# Local (requires DATABASE_URL)
pnpm seed:staging

# Via ECS task (recommended for staging)
aws ecs run-task \
  --cluster nasneh-staging-cluster \
  --task-definition nasneh-staging-api \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["pnpm","seed:staging"]}]}'
```

**Features:**
- ✅ Idempotent: can run multiple times without duplicating data
- ✅ Upserts by unique keys (phone, name)
- ✅ Updates existing records if found
- ✅ Logs created/updated/skipped counts

**Output:**
```
🌱 Starting staging E2E data seeding...

1️⃣  Creating/updating test user...
   ✅ User: __E2E__ Test Provider (+97333000001)

2️⃣  Creating/updating service provider...
   ✅ Provider: __E2E__ Test Services

3️⃣  Creating availability rules...
   ✅ Created rule for MONDAY
   ✅ Created rule for TUESDAY
   ...

4️⃣  Creating services...
   ✅ Created: __E2E__ Home Cleaning Service
   ✅ Created: __E2E__ Plumbing Repair
   ...

📊 Seeding Summary:
   ✅ Created: 12 records
   🔄 Updated: 0 records
   ⏭️  Skipped: 0 records

🎯 E2E Test Data Ready:
   👤 User: +97333000001
   🏢 Provider: __E2E__ Test Services
   📋 Services: 5
   📅 Availability: Mon-Fri 9am-5pm

📝 Service IDs for testing:
   1. __E2E__ Home Cleaning Service
      ID: abc-123-def
      URL: https://staging.nasneh.com/services/abc-123-def
   ...

✅ Staging E2E data seeding complete!
```

---

### Cleanup Staging Data

Removes all __E2E__* test data from staging database.

**What it deletes:**
- All services starting with `__E2E__`
- All providers starting with `__E2E__`
- All users starting with `__E2E__`
- Related availability rules (cascade)
- Related bookings (cascade)

**Usage:**

```bash
# Local (requires DATABASE_URL)
pnpm cleanup:staging

# Via ECS task (recommended for staging)
aws ecs run-task \
  --cluster nasneh-staging-cluster \
  --task-definition nasneh-staging-api \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["pnpm","cleanup:staging"]}]}'
```

**Output:**
```
🧹 Starting staging E2E data cleanup...

1️⃣  Deleting __E2E__ services...
   ✅ Deleted 5 services

2️⃣  Deleting __E2E__ service providers...
   ✅ Deleted 1 providers

3️⃣  Deleting __E2E__ users...
   ✅ Deleted 1 users

📊 Cleanup Summary:
   🗑️  Total deleted: 7 records

✅ Staging E2E data cleanup complete!
```

---

## ECS Task Execution

### Prerequisites

1. AWS CLI configured with staging access
2. ECS cluster and task definition deployed
3. Network configuration (subnets, security groups)

### Get ECS Configuration

```bash
# Get cluster name
aws ecs list-clusters

# Get task definition
aws ecs list-task-definitions | grep staging-api

# Get subnets and security groups
aws ecs describe-services \
  --cluster nasneh-staging-cluster \
  --services nasneh-staging-api-service \
  --query 'services[0].networkConfiguration'
```

### Run Seed Task

```bash
aws ecs run-task \
  --cluster nasneh-staging-cluster \
  --task-definition nasneh-staging-api:latest \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["pnpm","seed:staging"]}]}'
```

### View Logs

```bash
# Get task ARN from run-task output
TASK_ARN="arn:aws:ecs:me-south-1:xxx:task/nasneh-staging-cluster/xxx"

# Get log stream
aws ecs describe-tasks \
  --cluster nasneh-staging-cluster \
  --tasks $TASK_ARN \
  --query 'tasks[0].containers[0].name'

# View logs in CloudWatch
aws logs tail /ecs/nasneh-staging-api --follow
```

---

## Safety Notes

- ✅ Scripts are staging-only (check NODE_ENV or DATABASE_URL)
- ✅ All test data prefixed with `__E2E__` for easy identification
- ✅ Idempotent: safe to run multiple times
- ✅ Cleanup script only deletes `__E2E__*` records
- ⚠️ **DO NOT** run cleanup in production
- ⚠️ **DO NOT** commit DATABASE_URL to git

---

## Troubleshooting

### Error: DATABASE_URL not set

```bash
# Set DATABASE_URL for local testing
export DATABASE_URL="postgresql://user:pass@host:5432/db"
pnpm seed:staging
```

### Error: Prisma Client not generated

```bash
cd apps/api
pnpm db:generate
pnpm seed:staging
```

### Error: Permission denied

```bash
chmod +x scripts/seed-staging.ts
chmod +x scripts/cleanup-staging.ts
```

### ECS Task Failed

1. Check CloudWatch logs: `/ecs/nasneh-staging-api`
2. Verify DATABASE_URL secret in ECS task definition
3. Verify network configuration (subnets, security groups)
4. Check task execution role permissions
