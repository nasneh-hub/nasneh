# Visual PRD Mapping Table

> **Version:** 1.0  
> **Last Updated:** 2026-01-01  
> **Total Screens:** 43 MVP + 7 Later = 50 screens

## Overview

This document maps each Visual PRD screen to its corresponding PRD section, ClickUp Epic/Task, and future GitHub Issue/PR references.

---

## Screen Inventory Summary

| Category | MVP | Later | Total |
|----------|-----|-------|-------|
| Auth & Onboarding | 6 | 0 | 6 |
| Products & Cart | 6 | 0 | 6 |
| Services & Booking | 8 | 0 | 8 |
| Orders & Fulfillment | 5 | 0 | 5 |
| Payments | 4 | 0 | 4 |
| Vendor Dashboard | 4 | 0 | 4 |
| Provider Dashboard | 4 | 0 | 4 |
| Admin Dashboard | 4 | 0 | 4 |
| User Profile | 2 | 0 | 2 |
| Later (Roadmap) | 0 | 7 | 7 |
| **Total** | **43** | **7** | **50** |

---

## MVP Screens Mapping

### Auth & Onboarding (6 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| AUTH-001 | شاشة الترحيب | §4.1 Authentication | Auth | - | - |
| AUTH-002 | إدخال رقم الجوال | §4.1.1 OTP Request | Auth | Implement OTP request endpoint | - |
| AUTH-003 | إدخال رمز OTP | §4.1.2 OTP Verify | Auth | Implement OTP verify endpoint | - |
| AUTH-004 | انتظار WhatsApp | §4.1.3 OTP Delivery | Auth | Implement WhatsApp OTP delivery | #12 |
| AUTH-005 | إكمال الملف الشخصي | §4.2 User Profile | User & Roles | - | - |
| AUTH-006 | الصفحة الرئيسية | §4.3 Home | - | - | - |

### Products & Cart (6 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| PROD-001 | الصفحة الرئيسية | §5.1 Products Home | Products | - | - |
| PROD-002 | قائمة المنتجات | §5.2 Product Listing | Products | Implement product listing API | - |
| PROD-003 | تفاصيل المنتج | §5.3 Product Detail | Products | Implement product CRUD API | - |
| PROD-004 | سلة التسوق | §5.4 Cart | Orders + Fulfillment | Implement create order endpoint | - |
| PROD-005 | الدفع | §5.5 Checkout | Payments | Implement APS payment initiation | - |
| PROD-006 | تأكيد الطلب | §5.6 Order Confirmation | Orders + Fulfillment | - | - |

### Services & Booking (8 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| SRV-001 | قائمة الخدمات | §6.1 Services List | Services + Booking Types | - | - |
| SRV-002 | تفاصيل الخدمة | §6.2 Service Detail | Services + Booking Types | - | - |
| SRV-003 | اختيار نوع الحجز | §6.3 Booking Type Selection | Services + Booking Types | - | - |
| BKG-001 | اختيار التاريخ والوقت | §6.4 Date/Time Selection | Bookings Flow | - | - |
| BKG-002 | اختيار الموقع | §6.5 Location Selection | Bookings Flow | - | - |
| BKG-003 | تأكيد الحجز | §6.6 Booking Confirmation | Bookings Flow | - | - |
| BKG-004 | نجاح الحجز | §6.7 Booking Success | Bookings Flow | - | - |
| BKG-005 | تفاصيل الحجز | §6.8 Booking Detail | Bookings Flow | - | - |

### Orders & Fulfillment (5 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| ORD-001 | قائمة الطلبات | §7.1 Orders List | Orders + Fulfillment | Implement order listing APIs | - |
| ORD-002 | تفاصيل الطلب | §7.2 Order Detail | Orders + Fulfillment | Implement order status flow | - |
| ORD-003 | تتبع الطلب | §7.3 Order Tracking | Orders + Fulfillment | Implement order status flow | - |
| ORD-004 | تقييم الطلب | §7.4 Order Review | Orders + Fulfillment | - | - |
| ORD-005 | إلغاء الطلب | §7.5 Order Cancellation | Orders + Fulfillment | - | - |

### Payments (4 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| PAY-001 | طرق الدفع | §8.1 Payment Methods | Payments | Implement APS payment initiation | - |
| PAY-002 | دفع APS | §8.2 APS Payment | Payments | Implement APS payment initiation | #10 |
| PAY-003 | نجاح الدفع | §8.3 Payment Success | Payments | Implement APS webhook handler | #10 |
| PAY-004 | طلب استرداد | §8.4 Refund Request | Payments | - | #13 |

### Vendor Dashboard (4 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| VND-001 | لوحة تحكم البائع | §9.1 Vendor Dashboard | Vendor Dashboard | - | - |
| VND-002 | إدارة المنتجات | §9.2 Vendor Products | Vendor Dashboard | - | - |
| VND-003 | إضافة منتج | §9.3 Add Product | Vendor Dashboard | - | - |
| VND-004 | الطلبات الواردة | §9.4 Vendor Orders | Vendor Dashboard | - | - |

### Provider Dashboard (4 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| PRV-001 | لوحة تحكم مقدم الخدمة | §10.1 Provider Dashboard | Provider Dashboard | - | - |
| PRV-002 | إدارة الخدمات | §10.2 Provider Services | Provider Dashboard | - | - |
| PRV-003 | الحجوزات | §10.3 Provider Bookings | Provider Dashboard | - | - |
| PRV-004 | التقويم | §10.4 Provider Calendar | Provider Dashboard | - | - |

### Admin Dashboard (4 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| ADM-001 | لوحة تحكم الإدارة | §11.1 Admin Dashboard | Admin Dashboard | - | - |
| ADM-002 | إدارة المستخدمين | §11.2 Admin Users | Admin Dashboard | - | - |
| ADM-003 | إدارة البائعين | §11.3 Admin Vendors | Admin Dashboard | - | - |
| ADM-004 | إدارة الطلبات | §11.4 Admin Orders | Admin Dashboard | - | - |

### User Profile (2 screens)

| Screen ID | Screen Title | PRD Section | ClickUp Epic | ClickUp Task | GitHub Issue |
|-----------|--------------|-------------|--------------|--------------|--------------|
| USR-001 | الملف الشخصي | §4.2 User Profile | User & Roles | - | - |
| USR-002 | إعدادات الحساب | §4.2.1 Account Settings | User & Roles | - | - |

---

## Later Screens (Roadmap)

| Screen ID | Screen Title | Priority | Dependencies | Target Sprint |
|-----------|--------------|----------|--------------|---------------|
| LATER-001 | البحث المتقدم | P2 | Products + Services MVP | Sprint 4+ |
| LATER-002 | المفضلة | P2 | Products + Services MVP | Sprint 4+ |
| LATER-003 | مركز الإشعارات | P2 | Core MVP | Sprint 4+ |
| LATER-004 | برنامج الولاء | P3 | Payments MVP | Sprint 6+ |
| LATER-005 | الدردشة والدعم | P2 | Core MVP | Sprint 5+ |
| LATER-006 | التحليلات المتقدمة | P2 | Vendor/Provider MVP | Sprint 5+ |
| LATER-007 | دعم اللغات | P2 | Core MVP | Sprint 4+ |

---

## Flow Diagrams

### Auth Flow
```
AUTH-001 (Welcome) → AUTH-002 (Phone) → AUTH-003 (OTP) → AUTH-004 (WhatsApp Wait)
                                                              ↓ (10s timeout)
                                                         SMS Fallback
                                                              ↓
                                                    AUTH-005 (Profile) → AUTH-006 (Home)
```

### Product Purchase Flow
```
PROD-001 (Home) → PROD-002 (List) → PROD-003 (Detail) → PROD-004 (Cart)
                                                              ↓
PAY-003 (Success) ← PAY-002 (APS) ← PAY-001 (Methods) ← PROD-005 (Checkout)
       ↓
ORD-001 (Orders)
```

### Service Booking Flow
```
SRV-001 (List) → SRV-002 (Detail) → SRV-003 (Type) → BKG-001 (DateTime)
                                                           ↓
BKG-004 (Success) ← PAY-003 (Payment) ← BKG-003 (Confirm) ← BKG-002 (Location)
       ↓
ORD-001 (Orders)
```

### Vendor Order Flow
```
VND-001 (Dashboard) → VND-004 (Orders) → Accept/Reject
                                              ↓
                                    Processing → Ready → Shipped
```

---

## API Endpoint Mapping

| Screen | Primary Endpoint | Method |
|--------|------------------|--------|
| AUTH-002 | /api/auth/otp/request | POST |
| AUTH-003 | /api/auth/otp/verify | POST |
| AUTH-005 | /api/users/me | PATCH |
| PROD-002 | /api/products | GET |
| PROD-003 | /api/products/:id | GET |
| PROD-004 | /api/cart | GET/POST |
| PROD-005 | /api/orders | POST |
| PAY-002 | /api/payments/initiate | POST |
| PAY-003 | /api/webhooks/aps | POST |
| PAY-004 | /api/orders/:id/refund | POST |
| ORD-001 | /api/orders | GET |
| ORD-002 | /api/orders/:id | GET |
| VND-001 | /api/vendor/dashboard | GET |
| VND-002 | /api/vendor/products | GET |
| VND-003 | /api/vendor/products | POST |
| VND-004 | /api/vendor/orders | GET |
| PRV-001 | /api/provider/dashboard | GET |
| PRV-004 | /api/provider/bookings | GET |
| ADM-001 | /api/admin/dashboard | GET |
| ADM-002 | /api/admin/users | GET |

---

## Notes

1. **Screen IDs** follow the pattern: `{CATEGORY}-{NUMBER}` (e.g., AUTH-001, PROD-002)
2. **PRD Sections** reference the PRD_MASTER.md document
3. **GitHub Issues** will be created during Sprint implementation
4. **ClickUp Tasks** are linked to Sprint 1 tasks created in the backlog
5. All MVP screens must be implemented before Later screens
