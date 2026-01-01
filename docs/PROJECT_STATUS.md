# Project Status — Nasneh

**Current release/tag:** v0.1.0-foundation

## Sprint 1 Progress
| Task | Status | PR |
|------|--------|-----|
| [AUTH] Setup auth module structure | ✅ Done | #19 |
| [AUTH] Implement OTP request endpoint | ✅ Done | #20 |
| [AUTH] Implement WhatsApp OTP delivery | ✅ Done | #21 |
| [AUTH] Implement SMS fallback | ✅ Done | #22 |
| [AUTH] Implement OTP verify endpoint | ✅ Done | #23 |
| [AUTH] Implement refresh token flow | ✅ Done | #24 |
| [PROD] Create products table migration | ✅ Done | #25 |
| [PROD] Implement product CRUD API | ✅ Done | #26 |
| [PROD] Implement product images upload | ✅ Done | #27 |
| [PROD] Implement product listing API | ✅ Done | #26 (included) |
| [ORD] Create orders + order_items migrations | ✅ Done | #29 |
| [ORD] Implement order status flow | ✅ Done | #30 |
| [ORD] Implement order listing APIs | ✅ Done | #30 (included) |
| [ORD] Implement create order endpoint | ✅ Done | #31 |
| [PAY] Create payments + refunds migrations | ✅ Done | #32 |
| [PAY] Implement APS payment initiation | To Do | — |
| [PAY] Implement APS webhook handler | To Do | — |
| [PAY] Implement audit logging | ✅ Done | #30 (included) |

## Open PRs
| # | Title | Status |
|---|-------|--------|
| #32 | feat(db): create payments and refunds tables migration | Open |
| #31 | feat(orders): implement create order endpoint | Open |
| #30 | feat(orders): implement order status flow with audit logging | Open |
| #29 | feat(db): create orders and order_items tables migration | Open |
| #28 | docs: update PROJECT_STATUS.md with Sprint 1 progress | Open |
| #27 | feat(upload): implement product image upload to S3 | Open |
| #26 | feat(products): implement product CRUD API | Open |
| #25 | feat(db): create products table migration | Open |
| #24 | feat(auth): implement refresh token flow | Open |
| #23 | test(auth): add comprehensive OTP verify tests | Open |
| #22 | feat(auth): implement SMS fallback | Open |
| #21 | feat(auth): implement WhatsApp OTP delivery | Open |

## Open Issues
| # | Title |
|---|-------|
| 4 | [TECH] Generate favicons and meta images from logo |
| 1 | [TECH] Replace placeholder scripts with real build/lint/typecheck |

## P0 Audit Status
All P0 gaps from MVP Audit resolved in TECHNICAL_SPEC.md v2.1:
- [x] #8 — order_items table (§3 - Order Items)
- [x] #9 — fulfillment_type on orders (§3 - Orders)
- [x] #10 — APS webhook validation (§6 - APS Webhook Signature Validation)
- [x] #11 — audit_logs table (§3 - Audit Logs)
- [x] #12 — OTP WhatsApp fallback (§5 - OTP Delivery Channels)
- [x] #13 — refunds table (§3 - Refunds)

## Next 3 Actions
1. [PAY] Implement APS payment initiation
2. [PAY] Implement APS webhook handler
3. Merge all open PRs to main

## Blockers
None.

---
**Last updated:** 2026-01-01 by Sprint 1 - Payments Migration
