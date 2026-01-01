# ClickUp Setup Guide — Nasneh MVP

**Date:** 2026-01-01  
**Space URL:** https://app.clickup.com/90182234772/v/s/90189014546

---

## A. Workspace Structure

### Space
**Name:** Nasneh v2 (already exists)

### Lists (Create in this order)
| List | Icon | Purpose |
|------|------|---------|
| 📋 Backlog | 📋 | All tasks not yet scheduled |
| 🏃 Sprint 1 | 🏃 | Current sprint (Auth + Products + Orders + Payments) |
| 🏃 Sprint 2 | 🏃 | Next sprint (Services + Bookings + Provider) |
| 🏃 Sprint 3 | 🏃 | Future sprint (Admin + Polish) |
| 🐛 Bugs | 🐛 | Bug tracking |

### Statuses (Apply to Space)
```
Backlog → Ready → In Progress → Blocked → In Review → Done
```

### Custom Fields (Create at Space level)
| Field | Type | Options |
|-------|------|---------|
| Priority | Dropdown | P0, P1, P2 |
| Estimate | Number | Hours (1-8) |
| Type | Dropdown | Feature, Bug, Chore, Docs |
| Epic | Dropdown | (see Epics below) |

---

## B. MVP Epics

Create these as Epic dropdown options:

| Epic | Code | Scope |
|------|------|-------|
| Auth | AUTH | OTP WhatsApp→SMS, JWT, sessions |
| User & Roles | USER | Profile, addresses, role switching |
| Products | PROD | Product CRUD, categories, images |
| Services + Booking Types | SERV | Service CRUD, 3 booking types |
| Orders + Fulfillment | ORD | Order flow, delivery/pickup, items |
| Bookings Flow | BOOK | Booking flow, calendar, status |
| Payments | PAY | APS integration, webhooks, refunds |
| Vendor Dashboard | VEND | Vendor portal, orders, earnings |
| Provider Dashboard | PROV | Provider portal, bookings, calendar |
| Admin Dashboard | ADMIN | Basic admin panel, approvals |

---

## C. Sprint 1 Plan (18 Tasks)

**Focus:** Auth + Products + Orders + Payments  
**Duration:** 2 weeks  
**Capacity:** ~80-100 hours

### Sprint 1 Tasks

#### Epic: Auth (AUTH)
| # | Task | Description | Estimate | Priority |
|---|------|-------------|----------|----------|
| 1 | Setup auth module structure | Create auth routes, controllers, services folder structure | 4h | P0 |
| 2 | Implement OTP request endpoint | POST /auth/request-otp with rate limiting (5/hour per phone) | 6h | P0 |
| 3 | Implement WhatsApp OTP delivery | WhatsApp Business API integration with 10s timeout | 6h | P0 |
| 4 | Implement SMS fallback | AWS SNS fallback when WhatsApp fails/times out | 4h | P0 |
| 5 | Implement OTP verify endpoint | POST /auth/verify-otp with JWT generation | 6h | P0 |
| 6 | Implement refresh token flow | POST /auth/refresh with token rotation | 4h | P1 |

#### Epic: Products (PROD)
| # | Task | Description | Estimate | Priority |
|---|------|-------------|----------|----------|
| 7 | Create products table migration | Prisma schema for products table per TECHNICAL_SPEC | 4h | P0 |
| 8 | Implement product CRUD API | GET/POST/PATCH/DELETE /vendor/products | 6h | P0 |
| 9 | Implement product listing API | GET /products with filters, pagination | 4h | P0 |
| 10 | Implement product images upload | S3 upload with image validation | 6h | P1 |

#### Epic: Orders + Fulfillment (ORD)
| # | Task | Description | Estimate | Priority |
|---|------|-------------|----------|----------|
| 11 | Create orders + order_items migrations | Prisma schema per TECHNICAL_SPEC v2.1 (includes fulfillment_type) | 4h | P0 |
| 12 | Implement create order endpoint | POST /orders with order_items, fulfillment_type | 8h | P0 |
| 13 | Implement order status flow | PATCH /vendor/orders/:id with status transitions | 6h | P0 |
| 14 | Implement order listing APIs | GET /orders (customer), GET /vendor/orders (vendor) | 4h | P1 |

#### Epic: Payments (PAY)
| # | Task | Description | Estimate | Priority |
|---|------|-------------|----------|----------|
| 15 | Create payments + refunds migrations | Prisma schema per TECHNICAL_SPEC v2.1 | 4h | P0 |
| 16 | Implement APS payment initiation | POST /payments/initiate with idempotency | 8h | P0 |
| 17 | Implement APS webhook handler | POST /payments/webhook with signature validation | 8h | P0 |
| 18 | Implement audit logging | audit_logs table + logging service | 6h | P1 |

**Total Sprint 1:** 98 hours (18 tasks)

---

## D. Acceptance Criteria (Per Task)

### Task 1: Setup auth module structure
- [ ] Created `/apps/api/src/modules/auth/` folder
- [ ] Created routes.ts, controller.ts, service.ts files
- [ ] Registered auth routes in main app
- [ ] Unit test file created

### Task 2: Implement OTP request endpoint
- [ ] POST /auth/request-otp accepts { phone: string }
- [ ] Validates phone format (+973XXXXXXXX)
- [ ] Rate limited to 5 requests/hour per phone
- [ ] Returns { success: true, channel: "whatsapp" | "sms" }
- [ ] Stores OTP in Redis with 5-min TTL

### Task 3: Implement WhatsApp OTP delivery
- [ ] WhatsApp Business API client configured
- [ ] OTP template message sent
- [ ] 10-second delivery timeout implemented
- [ ] Delivery status logged
- [ ] Returns delivery confirmation or triggers fallback

### Task 4: Implement SMS fallback
- [ ] AWS SNS client configured
- [ ] SMS sent when WhatsApp fails/times out
- [ ] Fallback status logged
- [ ] Error handling for SNS failures

### Task 5: Implement OTP verify endpoint
- [ ] POST /auth/verify-otp accepts { phone, otp }
- [ ] Validates OTP from Redis
- [ ] Creates user if not exists
- [ ] Generates JWT access token (15min expiry)
- [ ] Generates refresh token (7 days expiry)
- [ ] Returns { accessToken, refreshToken, user }

### Task 6: Implement refresh token flow
- [ ] POST /auth/refresh accepts { refreshToken }
- [ ] Validates refresh token
- [ ] Rotates refresh token (old one invalidated)
- [ ] Returns new { accessToken, refreshToken }

### Task 7: Create products table migration
- [ ] Prisma schema matches TECHNICAL_SPEC
- [ ] Migration runs without errors
- [ ] Indexes on vendor_id, category_id
- [ ] Seed data for testing

### Task 8: Implement product CRUD API
- [ ] POST /vendor/products creates product
- [ ] GET /vendor/products lists vendor's products
- [ ] PATCH /vendor/products/:id updates product
- [ ] DELETE /vendor/products/:id soft-deletes
- [ ] Auth middleware validates vendor role

### Task 9: Implement product listing API
- [ ] GET /products returns paginated list
- [ ] Filters: category, vendor, price range, availability
- [ ] Search by name/description
- [ ] Sorted by created_at desc (default)

### Task 10: Implement product images upload
- [ ] POST /upload/image accepts multipart
- [ ] Validates file type (jpg, png, webp)
- [ ] Validates file size (max 5MB)
- [ ] Uploads to S3 bucket
- [ ] Returns { url: string }

### Task 11: Create orders + order_items migrations
- [ ] orders table matches TECHNICAL_SPEC v2.1
- [ ] order_items table with price snapshots
- [ ] fulfillment_type enum (delivery, pickup)
- [ ] Foreign keys and indexes created

### Task 12: Implement create order endpoint
- [ ] POST /orders accepts { vendor_id, items[], fulfillment_type, address? }
- [ ] Creates order + order_items in transaction
- [ ] Snapshots product prices at order time
- [ ] Calculates subtotal, commission, total
- [ ] Returns order with items

### Task 13: Implement order status flow
- [ ] PATCH /vendor/orders/:id accepts { status }
- [ ] Validates status transitions (pending→confirmed→preparing→ready→...)
- [ ] Logs status change in audit_logs
- [ ] Sends notification to customer (placeholder)

### Task 14: Implement order listing APIs
- [ ] GET /orders returns customer's orders
- [ ] GET /vendor/orders returns vendor's orders
- [ ] Includes order_items in response
- [ ] Filters: status, date range

### Task 15: Create payments + refunds migrations
- [ ] payments table with idempotency_key
- [ ] refunds table per TECHNICAL_SPEC v2.1
- [ ] audit_logs table per TECHNICAL_SPEC v2.1
- [ ] All foreign keys and indexes

### Task 16: Implement APS payment initiation
- [ ] POST /payments/initiate accepts { order_id }
- [ ] Generates idempotency key
- [ ] Calls APS API to create payment
- [ ] Stores payment record with pending status
- [ ] Returns { payment_url, payment_id }

### Task 17: Implement APS webhook handler
- [ ] POST /payments/webhook receives APS callbacks
- [ ] Captures raw body before parsing
- [ ] Validates signature (per TECHNICAL_SPEC §6)
- [ ] Updates payment status
- [ ] Updates order status on success
- [ ] Logs all webhook events

### Task 18: Implement audit logging
- [ ] audit_logs table created
- [ ] AuditService with log() method
- [ ] Captures actor, action, entity, diff, IP
- [ ] Integrated with order status changes
- [ ] Integrated with payment events

---

## E. Import Instructions

### Step 1: Create Custom Fields
1. Go to Space Settings → Custom Fields
2. Create each field from Section A

### Step 2: Create Lists
1. Create lists in order: Backlog, Sprint 1, Sprint 2, Sprint 3, Bugs

### Step 3: Import CSV
1. Go to Space → Import → CSV
2. Upload `clickup_import.csv`
3. Map columns:
   - Task Name → Name
   - Description → Description
   - Status → Status
   - Priority → Priority (custom field)
   - Estimate → Estimate (custom field)
   - Epic → Epic (custom field)
   - List → List

### Step 4: Link GitHub
1. Go to Space Settings → Integrations → GitHub
2. Connect your GitHub account
3. Select `nasneh-hub/nasneh` repository
4. Enable: Auto-link commits, PRs, Issues

### Step 5: Verify
1. Check all 18 Sprint 1 tasks imported
2. Verify custom fields populated
3. Test GitHub integration with a commit mentioning task ID

---

## F. GitHub References

| Issue | Related Tasks |
|-------|---------------|
| [#1](https://github.com/nasneh-hub/nasneh/issues/1) | Replace placeholder scripts | Task 7, 11, 15 (migrations) |
| [#4](https://github.com/nasneh-hub/nasneh/issues/4) | Generate favicons | Backlog (not Sprint 1) |

---

**Document End**
