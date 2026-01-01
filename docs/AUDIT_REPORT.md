# MVP Audit Report — Nasneh

**Date:** 2026-01-01  
**Scope:** MVP-only (Products + Services Booking + OTP + APS Payments)  
**Auditor:** Manus AI

---

## P0 Gaps (Blocks Launch / Risks Money-Data Loss)

### 1. Missing `order_items` Table
**Location:** TECHNICAL_SPEC.md § 3. Database Schema  
**Issue:** `orders` table has no line items. Cannot track what products were ordered, quantities, or per-item prices.  
**Risk:** Cannot fulfill orders, calculate refunds, or generate invoices.  
**Fix:** Add `order_items` table with: `id, order_id, product_id, quantity, unit_price, subtotal`.

### 2. Missing `fulfillment_type` on Orders
**Location:** TECHNICAL_SPEC.md § 3 (orders table)  
**Issue:** PRD_MASTER.md § 6.1 mentions "delivery/pickup" but orders table lacks `fulfillment_type` field.  
**Risk:** System cannot distinguish pickup vs delivery orders.  
**Fix:** Add `fulfillment_type (enum: delivery, pickup)` to orders table.

### 3. No Webhook Signature Validation Spec
**Location:** TECHNICAL_SPEC.md § 6. Security  
**Issue:** States "Webhook signature verification" but no implementation details (algorithm, header name, secret rotation).  
**Risk:** Payment webhooks can be spoofed → fake payment confirmations → money loss.  
**Fix:** Document APS webhook signature algorithm (HMAC-SHA256), header (`X-APS-Signature`), and validation logic.

### 4. No Audit Logs Table
**Location:** TECHNICAL_SPEC.md § 3 & § 6  
**Issue:** No `audit_logs` table defined. Critical for payment disputes, refund tracking, admin actions.  
**Risk:** Cannot investigate fraud, disputes, or compliance issues.  
**Fix:** Add `audit_logs` table: `id, actor_id, action, entity_type, entity_id, payload, ip_address, created_at`.

### 5. WhatsApp Availability Check Undefined
**Location:** TECHNICAL_SPEC.md § 5. Authentication Flow  
**Issue:** States "System checks if phone has WhatsApp" but no method specified. WhatsApp API doesn't expose this.  
**Risk:** OTP delivery logic is unimplementable as written.  
**Fix:** Clarify: Try WhatsApp first with 10s timeout → fallback to SMS on failure. Remove "check if has WhatsApp" language.

### 6. No Refund/Cancellation Flow in Data Model
**Location:** TECHNICAL_SPEC.md § 3 (payments table)  
**Issue:** `payments.status` includes `refunded` but no `refunds` table or cancellation_reason tracking.  
**Risk:** Cannot process partial refunds or track why orders were cancelled.  
**Fix:** Add `refunds` table: `id, payment_id, amount, reason, status, processed_by, created_at`.

---

## P1 Risks (Should Fix Before Launch)

### 1. No Idempotency Key Column
**Location:** TECHNICAL_SPEC.md § 6. Payment Security  
**Issue:** Mentions "idempotency keys" but no column in payments table.  
**Fix:** Add `idempotency_key (string, unique, indexed)` to payments table.

### 2. Rate Limit Storage Not Specified
**Location:** TECHNICAL_SPEC.md § 6. Rate Limits  
**Issue:** Rate limits defined but storage mechanism (Redis key structure, TTL) not documented.  
**Fix:** Document Redis key pattern: `ratelimit:{type}:{identifier}` with sliding window.

### 3. Vendor/Provider Payout Not Documented
**Location:** PRD_MASTER.md § 7, TECHNICAL_SPEC.md  
**Issue:** PRD says "Vendor/Provider receives (amount - commission)" but no payout table or settlement flow.  
**Fix:** Add `payouts` table and settlement schedule documentation (P1 for MVP, can be manual initially).

### 4. Missing `addresses` Table Schema
**Location:** TECHNICAL_SPEC.md § 4. API Endpoints  
**Issue:** API has `/users/me/addresses` but no addresses table in schema.  
**Fix:** Add `addresses` table: `id, user_id, label, address_line, area, block, road, building, flat, location (point), is_default`.

---

## OK / No Issues

| Area | Status |
|------|--------|
| Tech stack consistency (PRD vs TECH_SPEC) | ✅ OK |
| Design system completeness | ✅ OK |
| Service types (3 booking models) alignment | ✅ OK |
| OTP fallback logic (WhatsApp → SMS) | ✅ OK (with P0 fix) |
| Rate limits defined | ✅ OK |
| JWT + Refresh token flow | ✅ OK |
| File upload limits | ✅ OK |
| Currency (BHD, 3 decimals) consistency | ✅ OK |

---

## Action Checklist (P0 Fixes)

| # | Task | Priority | Issue |
|---|------|----------|-------|
| 1 | Add `order_items` table to TECHNICAL_SPEC.md | P0 | [#8](https://github.com/nasneh-hub/nasneh/issues/8) |
| 2 | Add `fulfillment_type` to orders table | P0 | [#9](https://github.com/nasneh-hub/nasneh/issues/9) |
| 3 | Document APS webhook signature validation | P0 | [#10](https://github.com/nasneh-hub/nasneh/issues/10) |
| 4 | Add `audit_logs` table to TECHNICAL_SPEC.md | P0 | [#11](https://github.com/nasneh-hub/nasneh/issues/11) |
| 5 | Clarify WhatsApp OTP fallback logic | P0 | [#12](https://github.com/nasneh-hub/nasneh/issues/12) |
| 6 | Add `refunds` table to TECHNICAL_SPEC.md | P0 | [#13](https://github.com/nasneh-hub/nasneh/issues/13) |

---

**Next Steps:**
1. Resolve all P0 issues (update TECHNICAL_SPEC.md)
2. Address P1 risks
3. Proceed to ClickUp backlog + sprints
4. Visual PRD after backlog frozen

---

**Last updated:** 2026-01-01
