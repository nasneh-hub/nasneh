# Project Status — Nasneh

**Current release/tag:** v0.3.0-sprint2

## ✅ Sprint 2 Complete

Sprint 2 completed with all 17 tasks merged. Services, Availability, Bookings, Cart, Reviews, and comprehensive tests implemented.

---

## 🚧 DevOps Gate (Sprint 2.5) — In Progress

DevOps Gate sprint to set up infrastructure and CI/CD before Sprint 3.

**Source of Truth:** [ClickUp DevOps Gate List](https://app.clickup.com/90182234772/v/l/li/901814719216)

### Tasks

| # | Task | Status | PR |
|---|------|--------|----|
| 1 | [DEVOPS] IaC Setup | ✅ Merged | #70 |
| 2 | [DEVOPS] VPC + Networking | ✅ Merged | #71 |
| 3 | [DEVOPS] RDS PostgreSQL | 🔄 In Review | #73 |
| 4 | [DEVOPS] ECS Fargate + ALB | ⏳ To Do | - |
| 5 | [DEVOPS] S3 + CloudFront | ⏳ To Do | - |
| 6 | [DEVOPS] CI/CD Pipeline | ⏳ To Do | - |
| 7 | [DEVOPS] Secrets Management | ⏳ To Do | - |
| 8 | [DEVOPS] Monitoring + Alerts | ⏳ To Do | - |

### Key Decisions

- **IaC Tool:** Terraform (chosen over CDK for separation of concerns)
- **Region:** AWS Bahrain (me-south-1)
- **Staging First:** All infrastructure deployed to staging before production
- **Documentation:** See [docs/DEVOPS_GATE.md](./DEVOPS_GATE.md)

---

## Sprint 2 Summary (Complete)

**All 17 tasks completed and merged to main. Tag v0.3.0-sprint2 created.**

### Merged PRs

| PR | Title | Phase |
|----|-------|-------|
| #45 | [SVC] Create services table migration | Phase 1 |
| #46 | [BOOK] Create bookings table migration | Phase 1 |
| #48 | [SVC] Implement service CRUD API | Phase 2 |
| #50 | [SVC] Implement service listing API | Phase 2 |
| #52 | [SVC] Availability schema + rules | Phase 2 |
| #54 | refactor: availability config defaults | Phase 2 |
| #55 | [SVC] Availability API + conflict checks | Phase 3 |
| #57 | [BOOK] Implement create booking endpoint | Phase 3 |
| #59 | [BOOK] Prevent double-booking (atomic) | Phase 3 |
| #60 | [BOOK] Implement booking status flow | Phase 4 |
| #61 | [BOOK] Implement booking listing APIs | Phase 4 |
| #62 | [USER] Implement user profile CRUD | Phase 4 |
| #63 | [USER] Implement address management | Phase 4 |
| #64 | [CART] Implement cart API (single-vendor) | Phase 5 |
| #65 | [REV] Create reviews table migration | Phase 5 |
| #66 | [REV] Implement review CRUD API | Phase 5 |
| #67 | [BOOK] Booking API tests | Phase 6 |
| #68 | [SVC] Service API tests | Phase 6 |

### Phase Breakdown

| Phase | Description | Tasks |
|-------|-------------|-------|
| Phase 1 | Migrations | 2/2 ✅ |
| Phase 2 | Services Core | 3/3 ✅ |
| Phase 3 | Availability + Bookings | 3/3 ✅ |
| Phase 4 | Bookings Flow + User | 4/4 ✅ |
| Phase 5 | Cart + Reviews | 3/3 ✅ |
| Phase 6 | Tests | 2/2 ✅ |

---

## Database Schema (Current)

| Table | Description | Sprint |
|-------|-------------|--------|
| users | Customer accounts with phone auth | S1 |
| vendors | Vendor profiles with commission rates | S1 |
| products | Product catalog with images | S1 |
| categories | Product categories | S1 |
| orders | Customer orders with fulfillment type | S1 |
| order_items | Line items with price snapshots | S1 |
| payments | Payment records with APS integration | S1 |
| refunds | Refund tracking | S1 |
| audit_logs | System-wide audit trail | S1 |
| otp_codes | OTP verification codes | S1 |
| refresh_tokens | JWT refresh tokens | S1 |
| addresses | User addresses with coordinates | S1 |
| **service_providers** | Service provider profiles | **S2** |
| **services** | Service catalog with types | **S2** |
| **bookings** | Service bookings with scheduling | **S2** |
| **availability_rules** | Weekly recurring availability | **S2** |
| **availability_overrides** | Date-specific overrides | **S2** |
| **availability_settings** | Provider-level settings | **S2** |
| **carts** | Shopping carts (single-vendor) | **S2** |
| **cart_items** | Cart line items | **S2** |
| **reviews** | User reviews with moderation | **S2** |

---

## API Endpoints (Sprint 2)

### Services API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /provider/services | Create service |
| GET | /provider/services | List provider's services |
| GET | /provider/services/stats | Service counts by status |
| GET | /provider/services/:id | Get service details |
| PATCH | /provider/services/:id | Update service |
| DELETE | /provider/services/:id | Soft delete |
| PATCH | /provider/services/:id/toggle | Toggle availability |
| GET | /services | Public listing with filters |
| GET | /services/search | Keyword search |
| GET | /services/featured | Featured services |
| GET | /services/category/:id | By category |
| GET | /services/provider/:id | By provider |
| GET | /services/:id | Public service details |
| GET | /services/:id/slots | Get available slots |

### Provider Calendar API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /provider/calendar | Get rules, overrides, settings |
| PATCH | /provider/calendar | Bulk update rules |
| POST | /provider/calendar/rules | Create single rule |
| PATCH | /provider/calendar/rules/:id | Update rule |
| DELETE | /provider/calendar/rules/:id | Delete rule |
| POST | /provider/calendar/overrides | Create override |
| PATCH | /provider/calendar/overrides/:id | Update override |
| DELETE | /provider/calendar/overrides/:id | Delete override |
| PATCH | /provider/calendar/settings | Update settings |

### Bookings API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /bookings | Create booking |
| GET | /bookings | List bookings (role-scoped) |
| GET | /bookings/:id | Get booking details |
| POST | /bookings/:id/confirm | Confirm booking |
| POST | /bookings/:id/start | Start booking |
| POST | /bookings/:id/complete | Complete booking |
| POST | /bookings/:id/cancel | Cancel booking |
| POST | /bookings/:id/no-show | Mark no-show |
| GET | /customer/bookings | Customer's bookings |
| GET | /provider/bookings | Provider's bookings |

### User API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | Get current user profile |
| PATCH | /users/me | Update current user profile |
| GET | /users | List users (admin) |
| GET | /users/:id | Get user by ID |
| PATCH | /users/:id | Update user by ID |
| GET | /users/me/addresses | List my addresses |
| POST | /users/me/addresses | Create address |
| GET | /users/me/addresses/:id | Get address |
| PATCH | /users/me/addresses/:id | Update address |
| DELETE | /users/me/addresses/:id | Delete address |
| POST | /users/me/addresses/:id/default | Set as default |

### Cart API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /cart | Get current user's cart |
| POST | /cart/items | Add item to cart |
| PATCH | /cart/items/:id | Update item quantity |
| DELETE | /cart/items/:id | Remove item from cart |
| DELETE | /cart | Clear entire cart |

### Reviews API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /reviews | Create review |
| GET | /reviews | List reviews |
| GET | /reviews/:id | Get review by ID |
| PATCH | /reviews/:id | Update own review |
| DELETE | /reviews/:id | Delete own review |
| POST | /admin/reviews/:id/approve | Approve review |
| POST | /admin/reviews/:id/reject | Reject review |
| GET | /users/me/reviews | Get my reviews |

---

## Key Features (Sprint 2)

### Availability System
- Weekly recurring rules (per day of week)
- Date-specific overrides (AVAILABLE/UNAVAILABLE)
- Buffer times (before/after bookings)
- Preparation days for DELIVERY_DATE services
- Override precedence (date overrides > weekly rules)
- Conflict detection hooks for bookings
- Configurable defaults via `apps/api/src/config/calendar.defaults.ts`

### Booking System
- Atomic double-booking prevention (SERIALIZABLE + SELECT FOR UPDATE)
- Status flow: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
- Role-based permissions for status transitions
- Cancellation with reason tracking
- No-show marking

### Cart System
- Single-vendor enforcement (409 DIFFERENT_VENDOR)
- Atomic operations with row locking
- Auto vendor lock/unlock

### Reviews System
- Polymorphic reviews (PRODUCT, SERVICE, VENDOR, PROVIDER, DRIVER)
- Admin moderation (PENDING → APPROVED/REJECTED)
- Rating 1-5 with optional comment
- One review per user per entity

---

## Sprint 1 Summary (Complete)

All 18 tasks completed and merged to main. Tag v0.2.0-sprint1 created.

| Epic | Tasks | PRs |
|------|-------|-----|
| Auth | 6 | #19-#24 |
| Products | 4 | #25-#27, #35-#36 |
| Orders | 4 | #29-#31, #37-#39 |
| Payments | 4 | #32-#34, #40-#42 |

---

## Sprint 3 Backlog (Planned)

| Task | Priority | Description |
|------|----------|-------------|
| [NOTIFY] Push notifications | P0 | FCM integration for booking updates |
| [SEARCH] Elasticsearch integration | P1 | Full-text search for services/products |
| [MEDIA] Image upload service | P1 | S3 integration for service images |
| [REPORT] Provider analytics dashboard | P2 | Booking stats, revenue reports |
| [ADMIN] Admin panel API | P2 | User management, moderation tools |

---

## Open Issues

| # | Title |
|---|-------|
| 4 | [TECH] Generate favicons and meta images from logo |
| 1 | [TECH] Replace placeholder scripts with real build/lint/typecheck |

## Blockers

None.

---
**Last updated:** 2026-01-02 — DevOps Gate in progress. RDS PostgreSQL PR #73 ready for review.
