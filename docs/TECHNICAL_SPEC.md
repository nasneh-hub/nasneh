# Nasneh - Technical Specification

**Version:** 2.0  
**Last Updated:** January 1, 2026  
**Status:** Source of Truth

---

## 1. Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework (App Router) |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Shadcn UI** | Component library |
| **React Hook Form** | Form handling |
| **Zod** | Validation |
| **TanStack Query** | Data fetching |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | API framework |
| **Prisma** | ORM |
| **PostgreSQL** | Database |
| **Redis** | Cache & sessions |
| **JWT** | Authentication |

### Infrastructure (AWS Bahrain - me-south-1)
| Service | Purpose |
|---------|---------|
| **Amplify** | Frontend hosting |
| **EC2** | Backend servers |
| **RDS** | PostgreSQL database |
| **ElastiCache** | Redis cache |
| **S3** | File storage |
| **CloudFront** | CDN |
| **SES** | Email |
| **SNS** | SMS notifications |
| **Secrets Manager** | Credentials |

### External Services
| Service | Purpose |
|---------|---------|
| **Amazon Payment Services (APS)** | Payment gateway |
| **Google Maps API** | Maps & location |

---

## 2. Repository Structure (Monorepo)

```
/nasneh
├── apps/
│   ├── web-customer/        # Customer web app (Next.js)
│   ├── dashboard/           # Unified dashboard (Next.js)
│   │   ├── admin/          # Admin routes
│   │   ├── vendor/         # Vendor routes
│   │   ├── provider/       # Provider routes
│   │   └── driver/         # Driver routes
│   └── api/                # Backend API (Node.js)
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── types/              # Shared TypeScript types
│   ├── config/             # Shared config (ESLint, TS)
│   └── utils/              # Shared utilities
│
├── docs/                   # Documentation
│   ├── PRD_MASTER.md
│   ├── TECHNICAL_SPEC.md
│   └── DESIGN_SYSTEM.md
│
├── prisma/
│   └── schema.prisma       # Database schema
│
└── README.md
```

---

## 3. Database Schema (Core Tables)

### Users & Authentication
```sql
users
├── id (UUID, PK)
├── phone (string, unique, indexed)
├── email (string, unique, nullable)
├── name (string)
├── avatar_url (string, nullable)
├── roles (enum[]: customer, vendor, provider, driver, admin)
├── trust_level (enum: new, verified, trusted)
├── status (enum: active, suspended, banned)
├── created_at, updated_at
```

### Vendors & Stores
```sql
vendors
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── store_name (string)
├── store_description (text)
├── logo_url (string)
├── category (enum: home_kitchen, crafts, market, food_truck)
├── subscription_plan (enum: basic, professional, enterprise)
├── subscription_expires_at (timestamp)
├── commission_rate (decimal)
├── status (enum: pending, approved, active, suspended)
├── created_at, updated_at
```

### Service Providers
```sql
service_providers
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── business_name (string)
├── description (text)
├── logo_url (string)
├── category (enum: home, personal, professional)
├── subscription_plan (enum)
├── subscription_expires_at (timestamp)
├── commission_rate (decimal)
├── status (enum: pending, approved, active, suspended)
├── created_at, updated_at
```

### Products
```sql
products
├── id (UUID, PK)
├── vendor_id (UUID, FK → vendors)
├── name (string)
├── description (text)
├── price (decimal 10,3)
├── images (string[])
├── category_id (UUID, FK)
├── is_available (boolean)
├── status (enum: active, inactive, deleted)
├── created_at, updated_at
```

### Services
```sql
services
├── id (UUID, PK)
├── provider_id (UUID, FK → service_providers)
├── name (string)
├── description (text)
├── price (decimal 10,3)
├── service_type (enum: appointment, delivery_date, pickup_dropoff)
├── duration_minutes (integer, nullable)        # For appointment type
├── preparation_days (integer, nullable)        # For delivery_date type
├── images (string[])
├── category_id (UUID, FK)
├── is_available (boolean)
├── status (enum: active, inactive, deleted)
├── created_at, updated_at
```

### Orders
```sql
orders
├── id (UUID, PK)
├── order_number (string, unique)
├── customer_id (UUID, FK → users)
├── vendor_id (UUID, FK → vendors)
├── driver_id (UUID, FK, nullable)
├── subtotal (decimal 10,3)
├── delivery_fee (decimal 10,3)
├── commission (decimal 10,3)
├── total (decimal 10,3)
├── status (enum: pending, confirmed, preparing, ready, picked_up, delivered, cancelled)
├── delivery_address (jsonb)
├── notes (text, nullable)
├── created_at, updated_at
```

### Bookings
```sql
bookings
├── id (UUID, PK)
├── booking_number (string, unique)
├── customer_id (UUID, FK → users)
├── provider_id (UUID, FK → service_providers)
├── service_id (UUID, FK → services)
├── service_type (enum: appointment, delivery_date, pickup_dropoff)
├── -- Appointment fields --
├── scheduled_at (timestamp, nullable)
├── duration_minutes (integer, nullable)
├── location_type (enum: customer, provider, nullable)
├── -- Delivery Date fields --
├── delivery_date (date, nullable)
├── delivery_time_slot (enum: morning, afternoon, evening, nullable)
├── preparation_days (integer, nullable)
├── -- Pickup & Dropoff fields --
├── pickup_date (date, nullable)
├── dropoff_date (date, nullable)
├── item_description (text, nullable)
├── -- Common fields --
├── service_fee (decimal 10,3)
├── platform_fee (decimal 10,3)
├── commission (decimal 10,3)
├── total (decimal 10,3)
├── status (enum: pending, confirmed, in_progress, completed, cancelled)
├── location (jsonb)
├── notes (text, nullable)
├── created_at, updated_at
```

### Payments
```sql
payments
├── id (UUID, PK)
├── transaction_id (string, unique)
├── payable_type (enum: order, booking)
├── payable_id (UUID)
├── amount (decimal 10,3)
├── currency (string, default: BHD)
├── status (enum: pending, authorized, captured, failed, refunded)
├── payment_method (enum: card)
├── gateway_response (jsonb)
├── created_at, updated_at
```

### Reviews
```sql
reviews
├── id (UUID, PK)
├── reviewer_id (UUID, FK → users)
├── reviewable_type (enum: product, service, vendor, provider, driver)
├── reviewable_id (UUID)
├── rating (integer 1-5)
├── comment (text, nullable)
├── status (enum: pending, approved, rejected)
├── created_at
```

---

## 4. API Endpoints

### Base URL
```
Production: https://api.nasneh.com/v1
Staging: https://api-staging.nasneh.com/v1
```

### Authentication
```
POST   /auth/request-otp     # Request OTP
POST   /auth/verify-otp      # Verify OTP & get tokens
POST   /auth/refresh         # Refresh access token
POST   /auth/logout          # Logout (invalidate tokens)
```

### Users
```
GET    /users/me             # Get current user
PATCH  /users/me             # Update profile
GET    /users/me/addresses   # Get addresses
POST   /users/me/addresses   # Add address
```

### Products (Customer)
```
GET    /products             # List products (with filters)
GET    /products/:id         # Get product details
GET    /products/featured    # Featured products
```

### Services (Customer)
```
GET    /services             # List services (with filters)
GET    /services/:id         # Get service details
GET    /services/:id/slots   # Get available time slots
```

### Orders (Customer)
```
POST   /orders               # Create order
GET    /orders               # List my orders
GET    /orders/:id           # Get order details
PATCH  /orders/:id/cancel    # Cancel order
```

### Bookings (Customer)
```
POST   /bookings             # Create booking
GET    /bookings             # List my bookings
GET    /bookings/:id         # Get booking details
PATCH  /bookings/:id/cancel  # Cancel booking
```

### Payments
```
POST   /payments/initiate    # Initiate payment
POST   /payments/webhook     # APS webhook (internal)
GET    /payments/:id         # Get payment status
```

### Reviews
```
POST   /reviews              # Submit review
GET    /reviews              # Get reviews (by reviewable)
```

### Vendor Dashboard
```
GET    /vendor/dashboard     # Dashboard stats
GET    /vendor/products      # My products
POST   /vendor/products      # Add product
PATCH  /vendor/products/:id  # Update product
DELETE /vendor/products/:id  # Delete product
GET    /vendor/orders        # My orders
PATCH  /vendor/orders/:id    # Update order status
GET    /vendor/earnings      # Earnings report
```

### Provider Dashboard
```
GET    /provider/dashboard   # Dashboard stats
GET    /provider/services    # My services
POST   /provider/services    # Add service
PATCH  /provider/services/:id # Update service
GET    /provider/bookings    # My bookings
PATCH  /provider/bookings/:id # Update booking status
GET    /provider/calendar    # Availability calendar
PATCH  /provider/calendar    # Update availability
GET    /provider/earnings    # Earnings report
```

### Driver Dashboard
```
GET    /driver/dashboard     # Dashboard stats
GET    /driver/deliveries    # My deliveries
PATCH  /driver/deliveries/:id # Update delivery status
GET    /driver/earnings      # Earnings report
```

### Admin
```
GET    /admin/dashboard      # Dashboard stats
GET    /admin/users          # List users
PATCH  /admin/users/:id      # Update user
GET    /admin/vendors        # List vendors
PATCH  /admin/vendors/:id    # Approve/reject vendor
GET    /admin/providers      # List providers
PATCH  /admin/providers/:id  # Approve/reject provider
GET    /admin/orders         # All orders
GET    /admin/bookings       # All bookings
GET    /admin/payments       # All payments
GET    /admin/reports        # Reports & analytics
```

---

## 5. Authentication Flow

### OTP Login
```
1. User enters phone number
2. POST /auth/request-otp { phone: "+97317XXXXXX" }
3. Server sends OTP via SMS (AWS SNS)
4. User enters OTP
5. POST /auth/verify-otp { phone, otp }
6. Server returns { accessToken, refreshToken, user }
7. Client stores tokens securely
```

### OTP Delivery Channels

**Priority Order:**
1. **WhatsApp** (Primary) - via WhatsApp Business API
2. **SMS** (Fallback) - via AWS SNS

**Flow Logic:**
```
1. User requests OTP
2. System checks if phone has WhatsApp
3. IF WhatsApp available → Send via WhatsApp Business API
4. IF WhatsApp fails OR not available → Fallback to SMS (AWS SNS)
5. Log delivery channel used
```

**WhatsApp Business API:**
- Provider: Meta WhatsApp Business API (via AWS or direct)
- Template: OTP verification message (pre-approved)
- Fallback timeout: 10 seconds

**Logging:**
| Field | Description |
|-------|-------------|
| phone | User phone number |
| channel | whatsapp / sms |
| status | sent / delivered / failed |
| timestamp | When sent |
| fallback_used | true / false |

---

### Token Structure
```
Access Token:
- JWT
- Expires: 15 minutes
- Contains: userId, roles

Refresh Token:
- Random string
- Expires: 7 days
- Stored in Redis
```

### Protected Routes
```
Authorization: Bearer <accessToken>

Middleware validates:
1. Token signature
2. Token expiry
3. User exists & active
4. Role permissions
```

---

## 6. Security

### API Security
- HTTPS only (TLS 1.3)
- JWT validation on every request
- Rate limiting (100 req/min public, 1000 req/min auth)
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS prevention (escape HTML)

### Rate Limits
| Endpoint Type | Limit |
|---------------|-------|
| Public | 100/min per IP |
| Authenticated | 1000/min per user |
| OTP request | 5/hour per phone |
| Login attempts | 10/hour per phone |

### Payment Security
- No card data stored (handled by APS)
- Webhook signature verification
- Idempotency keys

---

## 7. File Upload

### Allowed Types
```
Images: jpg, jpeg, png, webp
Documents: pdf
Max Size: 5MB per file
```

### Storage
```
Bucket: nasneh-prod-media
Path: /{type}/{id}/{filename}
CDN: CloudFront distribution
```

---

## 8. Notifications

### Channels
- **SMS**: AWS SNS (OTP, critical alerts)
- **Email**: AWS SES (receipts, marketing)
- **Push**: Future (mobile apps)

### Events
| Event | SMS | Email |
|-------|-----|-------|
| OTP | ✅ | ❌ |
| Order placed | ❌ | ✅ |
| Order status change | ✅ | ❌ |
| Booking confirmed | ✅ | ✅ |
| Payment receipt | ❌ | ✅ |

---

## 9. Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": [
      { "field": "phone", "message": "Must be valid Bahrain number" }
    ]
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | No permission |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal error |

---

## 10. Development Setup

### Prerequisites
```
Node.js 18+
npm or pnpm
PostgreSQL 15+
Redis
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=15m

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=me-south-1

# APS (Payment)
APS_MERCHANT_ID=...
APS_ACCESS_CODE=...
APS_SHA_REQUEST_PHRASE=...
APS_SHA_RESPONSE_PHRASE=...

# Email
SES_FROM_EMAIL=noreply@nasneh.com
```

### Commands
```bash
# Install dependencies
pnpm install

# Run development
pnpm dev

# Run database migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate

# Run tests
pnpm test

# Build for production
pnpm build
```

---

**Document End**
