# API Reference — Nasneh Platform

**Version:** 1.0  
**Last Updated:** 2026-01-07  
**Base URL (Staging):** `http://nasneh-staging-api-alb-1514033867.me-south-1.elb.amazonaws.com`  
**Base URL (Production):** TBD

---

## Overview

This document serves as the official API reference for the Nasneh platform. It distinguishes between **Implemented** endpoints (currently deployed and tested) and **Planned** endpoints (defined in the roadmap but not yet implemented).

**For detailed testing evidence and status codes, see:** [`docs/AUDITS/API_ROUTE_INVENTORY.md`](../AUDITS/API_ROUTE_INVENTORY.md)

---

## 1. Implemented Endpoints

These endpoints are currently deployed on staging and have been tested with evidence.

### 1.1 Health Check

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| GET | `/health` | No | Returns API health status |

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-01-07T07:10:11.388Z",
  "version": "v1"
}
```

---

### 1.2 Authentication

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| POST | `/api/v1/auth/request-otp` | No | Request OTP for phone login |
| POST | `/api/v1/auth/verify-otp` | No | Verify OTP and receive JWT tokens |
| POST | `/api/v1/auth/refresh` | Yes | Refresh access token using refresh token |
| POST | `/api/v1/auth/logout` | Yes | Logout from current session |
| POST | `/api/v1/auth/logout-all` | Yes | Logout from all sessions |
| GET | `/api/v1/auth/sessions` | Yes | Get all active sessions |
| GET | `/api/v1/auth/me` | Yes | Get current authenticated user |

#### POST /api/v1/auth/request-otp

Request an OTP code for phone number authentication.

**Staging Mock Mode:**
- When `OTP_MOCK_ENABLED=true` and `ENVIRONMENT=staging`:
  - Test number `+97336000000` receives fixed OTP `123456`
  - Other numbers receive random OTP (logged in CloudWatch but hidden for security)
  - Response includes `"channel": "mock"` indicator
- Rate limiting: 5 requests per 45 minutes per phone number

**Request:**
```bash
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "phone": "+97336000000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP generated and logged (staging mock mode)",
  "channel": "mock",
  "fallbackUsed": false,
  "expiresIn": 300
}
```

**Response (429 Rate Limited):**
```json
{
  "success": false,
  "error": "Too many OTP requests for this phone number",
  "retryAfter": 2001,
  "message": "Rate limit exceeded. Try again in 34 minute(s)."
}
```

---

#### POST /api/v1/auth/verify-otp

Verify an OTP code and receive authentication tokens.

**Staging Mock Mode:**
- Test number `+97336000000` must use OTP `123456`
- Other numbers use the OTP from CloudWatch logs: `/ecs/nasneh-staging/api`
- Maximum 5 attempts per OTP request

**Request:**
```bash
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+97336000000",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresIn": 900,
    "user": {
      "id": "usr_...",
      "phone": "+97336000000",
      "role": "customer"
    }
  }
}
```

**Response (400 Bad Request - Wrong OTP):**
```json
{
  "success": false,
  "error": "Invalid OTP. 4 attempt(s) remaining.",
  "attemptsRemaining": 4
}
```

**Response (400 Bad Request - No OTP Found):**
```json
{
  "success": false,
  "error": "No OTP found for this phone number. Please request a new one."
}
```

---

#### Other Auth Endpoints

For other authentication endpoints (refresh, logout, logout-all, sessions, me), see the existing implementation. These endpoints require JWT authentication via the `Authorization: Bearer <token>` header
```

---

### 1.3 Categories

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| GET | `/api/v1/categories` | No | List all product/service categories |
| GET | `/api/v1/categories/:id` | No | Get category by ID |
| GET | `/api/v1/categories/slug/:slug` | No | Get category by slug |

**Example: List Categories**
```bash
GET /api/v1/categories?type=PRODUCT
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Food & Beverages",
    "slug": "food-beverages",
    "type": "PRODUCT",
    "parentId": null,
    "children": [...]
  }
]
```

---

### 1.4 Bookings

| Method | Path | Auth | Role | Description |
|:-------|:-----|:-----|:-----|:------------|
| GET | `/api/v1/bookings` | Yes | Customer | List user's bookings |
| POST | `/api/v1/bookings` | Yes | Customer | Create new booking |
| GET | `/api/v1/bookings/:id` | Yes | Customer | Get booking details |
| POST | `/api/v1/bookings/:id/confirm` | Yes | Provider | Confirm booking |
| POST | `/api/v1/bookings/:id/start` | Yes | Provider | Start booking |
| POST | `/api/v1/bookings/:id/complete` | Yes | Provider | Complete booking |
| POST | `/api/v1/bookings/:id/cancel` | Yes | Customer/Provider | Cancel booking |
| POST | `/api/v1/bookings/:id/no-show` | Yes | Provider | Mark booking as no-show |

**Example: Create Booking**
```bash
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": "uuid",
  "scheduledAt": "2026-01-10T10:00:00Z",
  "locationType": "customer_location",
  "address": {...}
}
```

---

### 1.5 Payments

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| POST | `/api/v1/payments/webhook` | No | APS webhook handler (signature validated) |
| GET | `/api/v1/payments/return` | No | APS return URL handler |
| POST | `/api/v1/payments/initiate` | Yes | Initiate payment for order/booking |
| GET | `/api/v1/payments` | Yes | List user's payments |
| GET | `/api/v1/payments/:id` | Yes | Get payment details |

**Example: Initiate Payment**
```bash
POST /api/v1/payments/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "amount": 25.50,
  "currency": "BHD"
}
```

---

### 1.6 Upload

| Method | Path | Auth | Description |
|:-------|:-----|:-----|:------------|
| POST | `/api/v1/upload/image` | Yes | Upload product/service image |
| DELETE | `/api/v1/upload/image` | Yes | Delete uploaded image |

**Example: Upload Image**
```bash
POST /api/v1/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
type: "product" | "service"
```

---

### 1.7 Users

| Method | Path | Auth | Role | Description |
|:-------|:-----|:-----|:-----|:------------|
| GET | `/api/v1/users/me` | Yes | Customer | Get own profile |
| PATCH | `/api/v1/users/me` | Yes | Customer | Update own profile |
| GET | `/api/v1/users` | Yes | Admin | List all users |
| GET | `/api/v1/users/:id` | Yes | Admin | Get user by ID |
| PATCH | `/api/v1/users/:id` | Yes | Admin | Update user by ID |

**Example: Get Own Profile**
```bash
GET /api/v1/users/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "phone": "+97336000000",
  "email": "user@example.com",
  "name": "Ahmed Ali",
  "role": "CUSTOMER",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

## 2. Planned Endpoints

These endpoints are defined in the [`MASTER_ROADMAP.md`](MASTER_ROADMAP.md) but are **not yet implemented**.

### 2.1 Vendor Applications

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| POST | `/api/v1/vendor-applications` | Yes | Customer | Submit vendor application | [S3-03] |
| GET | `/api/v1/vendor-applications/me` | Yes | Customer | Get own application status | [S3-03] |
| GET | `/api/v1/admin/vendor-applications` | Yes | Admin | List all vendor applications | [S3-04] |
| PATCH | `/api/v1/admin/vendor-applications/:id` | Yes | Admin | Approve/reject application | [S3-04] |

---

### 2.2 Provider Applications

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| POST | `/api/v1/provider-applications` | Yes | Customer | Submit provider application | [S3-03] |
| GET | `/api/v1/provider-applications/me` | Yes | Customer | Get own application status | [S3-03] |
| GET | `/api/v1/admin/provider-applications` | Yes | Admin | List all provider applications | [S3-04] |
| PATCH | `/api/v1/admin/provider-applications/:id` | Yes | Admin | Approve/reject application | [S3-04] |

---

### 2.3 Admin Dashboard

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/admin/stats` | Yes | Admin | Get platform statistics | [S3-05] |

**Planned Response:**
```json
{
  "totalUsers": 1234,
  "totalVendors": 56,
  "totalProviders": 78,
  "totalOrders": 9012,
  "totalBookings": 3456,
  "revenue": {
    "today": 1234.50,
    "thisMonth": 45678.90
  }
}
```

---

### 2.4 Driver & Delivery

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| POST | `/api/v1/admin/drivers` | Yes | Admin | Create driver profile | [S3-02] |
| GET | `/api/v1/driver/deliveries` | Yes | Driver | Get assigned deliveries | [S3-02] |
| PATCH | `/api/v1/driver/deliveries/:id` | Yes | Driver | Update delivery status | [S3-02] |

---

### 2.5 Products (CRUD)

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/products` | No | Public | List all products | Sprint 4 |
| GET | `/api/v1/products/:id` | No | Public | Get product details | Sprint 4 |
| POST | `/api/v1/products` | Yes | Vendor | Create product | Sprint 4 |
| PATCH | `/api/v1/products/:id` | Yes | Vendor | Update product | Sprint 4 |
| DELETE | `/api/v1/products/:id` | Yes | Vendor | Delete product | Sprint 4 |

---

### 2.6 Services (CRUD)

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/services` | No | Public | List all services | Sprint 4 |
| GET | `/api/v1/services/:id` | No | Public | Get service details | Sprint 4 |
| POST | `/api/v1/services` | Yes | Provider | Create service | Sprint 4 |
| PATCH | `/api/v1/services/:id` | Yes | Provider | Update service | Sprint 4 |
| DELETE | `/api/v1/services/:id` | Yes | Provider | Delete service | Sprint 4 |

---

### 2.7 Orders

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/orders` | Yes | Customer | List user's orders | Sprint 4 |
| POST | `/api/v1/orders` | Yes | Customer | Create order from cart | Sprint 4 |
| GET | `/api/v1/orders/:id` | Yes | Customer | Get order details | Sprint 4 |
| PATCH | `/api/v1/orders/:id/cancel` | Yes | Customer | Cancel order | Sprint 4 |

---

### 2.8 Cart

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/cart` | Yes | Customer | Get user's cart | Sprint 4 |
| POST | `/api/v1/cart/items` | Yes | Customer | Add item to cart | Sprint 4 |
| PATCH | `/api/v1/cart/items/:id` | Yes | Customer | Update cart item quantity | Sprint 4 |
| DELETE | `/api/v1/cart/items/:id` | Yes | Customer | Remove item from cart | Sprint 4 |
| DELETE | `/api/v1/cart` | Yes | Customer | Clear cart | Sprint 4 |

---

### 2.9 Reviews

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/reviews` | No | Public | List reviews (by product/service) | Sprint 4 |
| POST | `/api/v1/reviews` | Yes | Customer | Submit review | Sprint 4 |
| PATCH | `/api/v1/reviews/:id` | Yes | Customer | Update own review | Sprint 4 |
| DELETE | `/api/v1/reviews/:id` | Yes | Customer | Delete own review | Sprint 4 |
| PATCH | `/api/v1/admin/reviews/:id` | Yes | Admin | Moderate review | Sprint 4 |

---

### 2.10 Addresses

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/addresses` | Yes | Customer | List user's addresses | Sprint 4 |
| POST | `/api/v1/addresses` | Yes | Customer | Add new address | Sprint 4 |
| PATCH | `/api/v1/addresses/:id` | Yes | Customer | Update address | Sprint 4 |
| DELETE | `/api/v1/addresses/:id` | Yes | Customer | Delete address | Sprint 4 |

---

### 2.11 Availability (Provider)

| Method | Path | Auth | Role | Description | Roadmap Ref |
|:-------|:-----|:-----|:-----|:------------|:------------|
| GET | `/api/v1/availability` | Yes | Provider | Get provider's availability rules | Sprint 4 |
| POST | `/api/v1/availability/rules` | Yes | Provider | Set availability rule | Sprint 4 |
| PATCH | `/api/v1/availability/rules/:id` | Yes | Provider | Update availability rule | Sprint 4 |
| DELETE | `/api/v1/availability/rules/:id` | Yes | Provider | Delete availability rule | Sprint 4 |

---

## 3. Summary

| Category | Implemented | Planned | Total |
|:---------|:------------|:--------|:------|
| **Auth** | 7 | 0 | 7 |
| **Categories** | 3 | 0 | 3 |
| **Bookings** | 8 | 0 | 8 |
| **Payments** | 5 | 0 | 5 |
| **Upload** | 2 | 0 | 2 |
| **Users** | 5 | 0 | 5 |
| **Health** | 1 | 0 | 1 |
| **Applications** | 0 | 8 | 8 |
| **Admin** | 0 | 1 | 1 |
| **Driver/Delivery** | 0 | 3 | 3 |
| **Products** | 0 | 5 | 5 |
| **Services** | 0 | 5 | 5 |
| **Orders** | 0 | 4 | 4 |
| **Cart** | 0 | 5 | 5 |
| **Reviews** | 0 | 5 | 5 |
| **Addresses** | 0 | 4 | 4 |
| **Availability** | 0 | 4 | 4 |
| **Total** | **31** | **44** | **75** |

**Completion:** 41% (31 out of 75 total planned endpoints)

---

## 4. Authentication

All authenticated endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

**Token Expiry:**
- Access Token: 15 minutes
- Refresh Token: 7 days

**Refresh Flow:**
```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

---

## 5. Error Responses

All endpoints follow a consistent error response format:

**400 Bad Request:**
```json
{
  "error": "Bad Request",
  "message": "Phone number is required",
  "statusCode": 400
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

**404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "statusCode": 404
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

---

## 6. Rate Limiting

**OTP Endpoints:**
- `/api/v1/auth/request-otp`: 3 requests per 5 minutes per phone number
- `/api/v1/auth/verify-otp`: 5 requests per 5 minutes per phone number

**Other Endpoints:**
- General rate limit: 100 requests per minute per IP

---

## 7. Changelog

| Date | Version | Changes |
|:-----|:--------|:--------|
| 2026-01-07 | 1.0 | Initial API Reference created with 31 implemented endpoints |

---

## 8. Related Documents

- **API Route Inventory (Evidence-Based):** [`docs/AUDITS/API_ROUTE_INVENTORY.md`](../AUDITS/API_ROUTE_INVENTORY.md)
- **Master Roadmap:** [`docs/SPECS/MASTER_ROADMAP.md`](MASTER_ROADMAP.md)
- **PRD Master:** [`docs/SPECS/PRD_MASTER.md`](PRD_MASTER.md)
- **Technical Spec:** [`docs/SPECS/TECHNICAL_SPEC.md`](TECHNICAL_SPEC.md)
