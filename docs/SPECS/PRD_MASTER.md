# Nasneh - Product Requirements Document (PRD)

**Version:** 2.0  
**Last Updated:** January 1, 2026  
**Status:** Source of Truth

---

## 1. Project Overview

### What is Nasneh?
Nasneh (ناسنه = "Our People") is a **multi-category digital marketplace** for Bahrain that connects:
- **Customers** → Browse, order products, book services
- **Vendors** → Sell products (home kitchens, crafts, food trucks)
- **Service Providers** → Offer services (cleaning, beauty, maintenance)
- **Drivers** → Deliver orders

### Core Philosophy
- "مني الك ومنك الي" (From me to you, from you to me)
- Support Bahraini productive families
- Keep money circulating in local economy

### Platform Model
**Nasneh is a PLATFORM ONLY:**
- ❌ Does NOT own products or provide services
- ❌ Does NOT employ vendors/providers/drivers
- ❌ Does NOT guarantee quality or outcomes
- ✅ Provides technology infrastructure
- ✅ Facilitates payments
- ✅ Coordinates delivery/booking

---

## 2. Business Model

### Revenue Streams

| Stream | Description |
|--------|-------------|
| **Subscription** | Monthly/Annual plans for vendors & providers |
| **Commission** | 5-12% per order (based on plan) |
| **Delivery Fee** | 10% platform fee from driver earnings |
| **Booking Fee** | 10% platform fee on service bookings |

### Subscription Plans

| Plan | Price/Month | Products | Commission |
|------|-------------|----------|------------|
| Basic | 10 BHD | 25 | 12% |
| Professional | 25 BHD | 100 | 8% |
| Enterprise | 50 BHD | Unlimited | 5% |

---

## 3. User Roles

### 3.1 Customer (Default)
**Every user starts as Customer**

**Capabilities:**
- Browse products & services
- Place orders (delivery/pickup)
- Book services
- Track orders & bookings
- Submit reviews
- Manage addresses
- Earn loyalty points

**Requirements:**
- Phone verified (mandatory)
- Email verified (to purchase/book)

---

### 3.2 Vendor (Products)
**Sells physical products or food**

**Capabilities:**
- Manage store profile
- Add/edit products
- Receive & manage orders
- View earnings & analytics
- Respond to reviews

**Activation:**
1. Submit application
2. Upload KYC documents
3. Admin approval
4. Pay subscription
5. Start selling

**Vendor Types:**
- Individual (home kitchen, crafter)
- Registered Business (CR holder)

---

### 3.3 Service Provider (Services)
**Offers professional or personal services**

**Capabilities:**
- Manage service listings
- Set availability calendar
- Receive & manage bookings
- Portfolio management
- View earnings

**Activation:**
Same as Vendor

**Service Categories:**
- Home services (cleaning, maintenance)
- Personal services (beauty, fitness)
- Professional services (consulting, tutoring)

---

### 3.4 Driver (Delivery)
**Delivers orders from vendors to customers**

**Capabilities:**
- Accept/reject deliveries
- Navigate to pickup & delivery
- Update delivery status
- View earnings

**Driver Types:**
- Independent drivers
- Company-affiliated drivers
- Vendor-owned drivers

---

### 3.5 Admin
**Manages entire platform**

**Capabilities:**
- Approve/reject vendors & providers
- Manage users & roles
- Handle disputes & refunds
- View reports & analytics
- Configure system settings

---

## 4. Account System

### One Account, Multiple Roles
- Single user can have multiple roles
- Role switching (not account switching)
- No duplicate accounts needed

**Supported Combinations:**
- Customer only (default)
- Customer + Vendor
- Customer + Service Provider
- Customer + Driver
- Any valid combination

---

## 5. Categories

### Product Categories
1. **Home Kitchens** → Food from home cooks
2. **Crafts & Handmade** → Artisan products
3. **Market Products** → Local goods
4. **Food Trucks** → Mobile food vendors

### Service Categories
1. **Home Services** → Cleaning, maintenance, repairs
2. **Personal Services** → Beauty, fitness, wellness
3. **Professional Services** → Consulting, tutoring

---

## 5.1 Service Types (Booking Models)

Services have 3 different booking types based on how the service is delivered:

### Type 1: Appointment (موعد حضور)
**Provider comes to customer OR customer goes to provider**

| Field | Description |
|-------|-------------|
| scheduled_at | Date + Time of appointment |
| duration_minutes | How long the service takes |
| location_type | customer_location / provider_location |
| location | Address details |

**Examples:**
- Home cleaning (provider → customer)
- Beauty services at salon (customer → provider)
- Home maintenance (provider → customer)

---

### Type 2: Delivery Date (موعد تسليم)
**Provider creates something and delivers it on a specific date**

| Field | Description |
|-------|-------------|
| delivery_date | Date of delivery |
| delivery_time_slot | Morning / Afternoon / Evening |
| delivery_address | Where to deliver |
| preparation_days | Days needed to prepare |

**Examples:**
- Custom cake (baker prepares, delivers on date)
- Tailoring (tailor makes, delivers on date)
- Custom furniture (carpenter makes, delivers on date)

---

### Type 3: Pickup & Dropoff (استلام وتسليم)
**Customer gives item to provider, provider returns it later**

| Field | Description |
|-------|-------------|
| pickup_date | When provider picks up item |
| dropoff_date | When provider returns item |
| pickup_address | Where to pickup from |
| dropoff_address | Where to return to |
| item_description | What item is being serviced |

**Examples:**
- Laundry service (pickup clothes → wash → return)
- Car detailing (pickup car → clean → return)
- Device repair (pickup phone → fix → return)

---

### Service Type Summary

| Type | Customer Action | Provider Action | Key Dates |
|------|-----------------|-----------------|----------|
| **Appointment** | Books time slot | Shows up at time | scheduled_at |
| **Delivery Date** | Orders service | Prepares & delivers | delivery_date |
| **Pickup & Dropoff** | Hands over item | Picks up, services, returns | pickup_date + dropoff_date |

---

## 6. Core Flows

### 6.1 Product Order Flow
```
Customer browses → Adds to cart → Checkout → Payment
    ↓
Vendor receives order → Prepares → Ready for pickup
    ↓
Driver assigned → Picks up → Delivers → Complete
```

### 6.2 Service Booking Flow
```
Customer browses services → Selects provider → Picks time slot
    ↓
Payment → Booking confirmed
    ↓
Provider performs service → Customer confirms → Complete
```

---

## 7. Payment System

### Payment Gateway
**Amazon Payment Services (APS)**

### Supported Methods
- Credit/Debit Cards (Visa, Mastercard)
- 3D Secure authentication

### Payment Flow
1. Customer pays full amount
2. Platform holds payment
3. After completion:
   - Vendor/Provider receives (amount - commission)
   - Driver receives delivery fee
   - Platform retains commission + fees

---

## 8. Authentication

### Passwordless Login
- Phone + OTP (WhatsApp/SMS)
- No passwords
- JWT + Refresh tokens

### Trust Levels
| Level | Requirements |
|-------|-------------|
| New | Phone verified |
| Verified | + Email verified |
| Trusted | + Profile complete |

---

## 9. MVP Scope (Phase 1)

### ✅ Included
- User registration & authentication
- Vendor & Provider onboarding
- Product & Service listings
- Orders & Bookings
- Single-vendor cart
- Delivery coordination
- Payment processing
- Reviews & ratings
- Admin dashboard
- Basic notifications

### ❌ NOT Included (Phase 1)
- Multi-vendor cart
- Social login
- Mobile apps (web-first)
- AI recommendations
- Live chat
- Wallet system

---

## 10. Applications

| App | URL | Purpose |
|-----|-----|---------|
| Customer Web | nasneh.com | Browse, order, book |
| Dashboard | dashboard.nasneh.com | Vendor, Provider, Driver, Admin |
| API | api.nasneh.com | Backend services |

---

## 11. Success Metrics (Phase 1)

| Metric | Target |
|--------|--------|
| Active Vendors/Providers | 50+ |
| Registered Customers | 500+ |
| Completed Orders/Bookings | 1,000+ |
| Cancellation Rate | < 5% |
| Platform Rating | 4.0+ |
| System Uptime | > 99% |

---

## 12. Timeline

| Phase | Focus | Timeline |
|-------|-------|----------|
| Phase 1 | MVP Launch (Bahrain) | Q1 2026 |
| Phase 2 | Growth & Mobile Apps | Q2-Q3 2026 |
| Phase 3 | GCC Expansion | Q4 2026+ |

---

## Quick Reference

### URLs
- Production: nasneh.com
- Dashboard: dashboard.nasneh.com
- API: api.nasneh.com

### Tech Stack
- Frontend: Next.js 14+, TypeScript, Tailwind CSS
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL
- Infrastructure: AWS (Bahrain region)
- Payments: Amazon Payment Services

### Currency
- BHD (Bahraini Dinar)
- 3 decimal places (e.g., 1.500 BHD)

---

**Document End**
