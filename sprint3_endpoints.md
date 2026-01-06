# Sprint 3 Endpoints - Official Route Map

## S3-01: Categories API
**Base:** `/api/v1/categories`
- `GET /` - List all categories (public)

## S3-03: Vendor & Provider Applications
**Base:** `/api/v1/vendor-applications` (protected)
- `POST /` - Submit vendor application
- `GET /me` - Get my vendor application

**Base:** `/api/v1/provider-applications` (protected)
- `POST /` - Submit provider application
- `GET /me` - Get my provider application

## S3-04: Admin Application Review
**Base:** `/api/v1/admin/vendor-applications` (admin only)
- `GET /` - List all vendor applications
- `PATCH /:id` - Approve/reject vendor application

**Base:** `/api/v1/admin/provider-applications` (admin only)
- `GET /` - List all provider applications
- `PATCH /:id` - Approve/reject provider application

## S3-05: Admin Dashboard Stats
**Base:** `/api/v1/admin/stats` (admin only)
- `GET /` - Get platform statistics

## S3-06: Driver & Delivery APIs
**Admin - Drivers:**
**Base:** `/api/v1/admin/drivers` (admin only)
- `POST /` - Create driver
- `GET /` - List all drivers

**Admin - Deliveries:**
**Base:** `/api/v1/admin/deliveries` (admin only)
- `POST /` - Create delivery assignment

**Driver:**
**Base:** `/api/v1/driver/deliveries` (driver only)
- `GET /` - Get my assigned deliveries
- `PATCH /:id` - Update delivery status

---

## Correct Paths for Testing

### Admin Endpoints (require admin auth):
1. `/api/v1/admin/stats` ✅
2. `/api/v1/admin/vendor-applications` ✅
3. `/api/v1/admin/provider-applications` ✅
4. `/api/v1/admin/drivers` ✅
5. `/api/v1/admin/deliveries` ✅

### Driver Endpoints (require driver auth):
1. `/api/v1/driver/deliveries` ✅

### Public/Protected Endpoints:
1. `/api/v1/categories` ✅ (public)
2. `/api/v1/vendor-applications` ✅ (protected)
3. `/api/v1/provider-applications` ✅ (protected)

---

## Previous Test Errors (404s)

**Wrong paths tested:**
- ❌ `/api/v1/admin/applications/vendors` → Should be `/api/v1/admin/vendor-applications`
- ❌ `/api/v1/drivers` → Should be `/api/v1/admin/drivers` (admin) or `/api/v1/driver/deliveries` (driver)
