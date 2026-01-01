# Project Status — Nasneh

**Current release/tag:** v0.2.0-sprint1

## 🚀 Sprint 2 In Progress

Sprint 2 started. Phase 1 (migrations) complete.

---

## Sprint 2 Progress: 2/17 tasks (12%)

### Phase 1: Migrations ✅ Complete
| Task | Status | PR |
|------|--------|-----|
| [SVC] Create services table migration | ✅ Merged | #45 |
| [BOOK] Create bookings table migration | ✅ Merged | #46 |

### Phase 2: Services Core (Next)
| Task | Status | PR |
|------|--------|-----|
| [SVC] Implement service CRUD API | 🔲 To Do | - |
| [SVC] Implement service listing API | 🔲 To Do | - |
| [SVC] Availability schema + rules | 🔲 To Do | - |

### Phase 3: Availability + Bookings Core
| Task | Status | PR |
|------|--------|-----|
| [SVC] Availability API + conflict checks | 🔲 To Do | - |
| [BOOK] Implement create booking endpoint | 🔲 To Do | - |
| [BOOK] Prevent double-booking | 🔲 To Do | - |

### Phase 4: Bookings Flow + User
| Task | Status | PR |
|------|--------|-----|
| [BOOK] Implement booking status flow | 🔲 To Do | - |
| [BOOK] Implement booking listing APIs | 🔲 To Do | - |
| [USER] Implement user profile CRUD | 🔲 To Do | - |
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
**Last updated:** 2026-01-02 — Sprint 2 Phase 1 Complete (Services + Bookings migrations)
