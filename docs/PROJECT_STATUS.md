# Project Status — Nasneh

**Current release/tag:** v0.2.0-sprint1

## 🚀 Sprint 2 In Progress

Sprint 2 started. Phase 2 (Services Core) complete. Phase 3 (Availability + Bookings) starting.

---

## Sprint 2 Progress: 11/17 tasks (65%)

### Phase 1: Migrations ✅ Complete
| Task | Status | PR |
|------|--------|-----|
| [SVC] Create services table migration | ✅ Merged | #45 |
| [BOOK] Create bookings table migration | ✅ Merged | #46 |

### Phase 2: Services Core ✅ Complete
| Task | Status | PR |
|------|--------|-----|
| [SVC] Implement service CRUD API | ✅ Merged | #48 |
| [SVC] Implement service listing API | ✅ Merged | #50 |
| [SVC] Availability schema + rules | ✅ Merged | #52 |

### Phase 3: Availability + Bookings Core ✅ Complete
| Task | Status | PR |
|------|--------|-----|
| [SVC] Availability API + conflict checks | ✅ Merged | #55 |
| [BOOK] Implement create booking endpoint | ✅ Merged | #57 |
| [BOOK] Prevent double-booking | ✅ Merged | #59 |

### Phase 4: Bookings Flow + User
| Task | Status | PR |
|------|--------|-----|
| [BOOK] Implement booking status flow | ✅ Merged | #60 |
| [BOOK] Implement booking listing APIs | ✅ Merged | #61 |
| [USER] Implement user profile CRUD | ✅ Merged | #62 |
| [USER] Implement address management | 🔲 To Do | - |

### Phase 5: Cart + Reviews
| Task | Status | PR |
|------|--------|-----|
| [CART] Implement cart API (single-vendor) | 🔲 To Do | - |
| [REV] Create reviews table migration | 🔲 To Do | - |
| [REV] Implement review CRUD API | 🔲 To Do | - |

### Phase 6: Tests
| Task | Status | PR |
|------|--------|-----|
| [SVC] Service API tests | 🔲 To Do | - |
| [BOOK] Booking API tests | 🔲 To Do | - |

---

## Database Schema (Updated)

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
| **service_providers** | Service provider profiles | **S2** |
| **services** | Service catalog with types | **S2** |
| **bookings** | Service bookings with scheduling | **S2** |
| **availability_rules** | Weekly recurring availability | **S2** |
| **availability_overrides** | Date-specific overrides | **S2** |
| **availability_settings** | Provider-level settings | **S2** |

---

## API Endpoints (Sprint 2)

### Services API (PR #48, #50)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /provider/services | Create service |
| GET | /provider/services | List provider's services (with status filter) |
| GET | /provider/services/stats | Service counts by status |
| GET | /provider/services/:id | Get service details |
| PATCH | /provider/services/:id | Update service |
| DELETE | /provider/services/:id | Soft delete |
| PATCH | /provider/services/:id/toggle | Toggle availability |
| GET | /services | Public listing with filters + sorting |
| GET | /services/search | Keyword search |
| GET | /services/featured | Featured services |
| GET | /services/category/:id | By category |
| GET | /services/provider/:id | By provider |
| GET | /services/:id | Public service details |
| GET | /services/:id/slots | Get available slots |

### Provider Calendar API (PR #52)
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

### Filters & Sorting (PR #50)

- **Filters:** serviceType, categoryId, providerId, minPrice, maxPrice, isAvailable, search, status
- **Sorting:** newest, oldest, price_asc, price_desc, name_asc, name_desc
- **Pagination:** page, limit (max 100), returns total, totalPages, hasNext, hasPrev

---

## Availability System (PR #52)

### Features
- Weekly recurring rules (per day of week)
- Date-specific overrides (AVAILABLE/UNAVAILABLE)
- Buffer times (before/after bookings)
- Preparation days for DELIVERY_DATE services
- Override precedence (date overrides > weekly rules)
- Conflict detection hooks for bookings

### Defaults (Configurable Per Provider)
- **Source of Truth:** `apps/api/src/config/calendar.defaults.ts`
- **Details:** These MVP defaults are used when creating new provider settings and can be overridden via environment variables. See `TECHNICAL_SPEC.md` for more details.

### Exported Hooks (for bookings module)
- `checkBookingAvailability()` - Main validation hook
- `getNextAvailableSlot()` - Suggest alternatives

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

## Open Issues


| # | Title |
|---|-------|
| 4 | [TECH] Generate favicons and meta images from logo |
| 1 | [TECH] Replace placeholder scripts with real build/lint/typecheck |

## Blockers

None.

---
**Last updated:** 2026-01-02 — Sprint 2 Phase 2 complete: Availability schema + rules (PR #52)
