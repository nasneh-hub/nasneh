# Nasneh Master Roadmap

**Version:** 2.0  
**Date:** January 4, 2026  
**Author:** Manus AI  
**Status:** Source of Truth for MVP Development

---

## 1. Introduction

This Master Roadmap provides a strategic, evidence-based plan for reaching the Nasneh MVP (Phase 1) launch. It is based on two key documents:

1.  **Pre-Sprint 3 Comprehensive Audit Report** (`docs/AUDITS/AUDIT_2026-01-04_PRE-SPRINT3.md`) [1]
2.  **Final System Verification Report** (`docs/AUDITS/VERIFICATION_2026-01-04_PRE-SPRINT3.md`) [2]

This document supersedes all previous informal plans and serves as the single source of truth for sprint planning, feature prioritization, and timeline management up to the MVP launch.

---

## 2. Current State (As of January 4, 2026)

The platform is **65% complete** against the PRD Phase 1 requirements. The backend foundation is strong, but critical user-facing and administrative features are missing.

| Category | Status | Details (from Audit Report [1]) |
|:---|:---:|:---|
| **MVP Readiness** | ⚠️ **65%** | Backend is solid, but blocked by missing P0 features. |
| **Backend API** | ✅ **85% Done** | 86 endpoints implemented across 12 modules. |
| **Database** | ✅ **100% Done** | 19 models deployed; migrations stable. |
| **CI/CD & Infra** | ✅ **100% Done** | Fully automated, stable, and verified. |
| **Frontend Apps** | ❌ **0% Done** | Placeholder repositories exist; no UI/UX implemented. |

---

## 3. PRD Phase 1 Feature Checklist

This checklist tracks the completion status of every feature defined in the PRD (§9) for the MVP scope.

| Feature | PRD Ref. | Status | Evidence / Notes |
|:---|:---:|:---:|:---|
| **User Registration & Auth** | §8 | ✅ **DONE** | OTP, JWT, and session management are implemented and verified. |
| **Vendor Onboarding** | §3.2 | ❌ **MISSING** | No APIs or DB models exist for `VendorApplication`. |
| **Provider Onboarding** | §3.3 | ❌ **MISSING** | No APIs or DB models exist for `ProviderApplication`. |
| **Product Listings** | §3.2 | ✅ **DONE** | Full CRUD APIs for products are implemented. |
| **Service Listings** | §3.3 | ✅ **DONE** | Full CRUD APIs for all 3 service types are implemented. |
| **Orders** | §6.1 | ✅ **DONE** | Core logic for creating and managing orders is complete. |
| **Bookings** | §6.2 | ✅ **DONE** | Core logic for creating and managing bookings is complete. |
| **Single-Vendor Cart** | §9 | ✅ **DONE** | The cart API supports adding items from a single vendor. |
| **Delivery Coordination** | §3.4 | ❌ **MISSING** | No `Driver` role, APIs, or `DeliveryAssignment` model exist. |
| **Payment Processing** | §7 | ✅ **DONE** | Payments module is implemented and ready for APS integration. |
| **Reviews & Ratings** | §9 | ✅ **DONE** | Full CRUD APIs for reviews, including admin moderation. |
| **Admin Dashboard** | §3.5 | ❌ **MISSING** | No APIs for core admin functions like application review or user management. |
| **Basic Notifications** | §9 | ⚠️ **PARTIAL** | A placeholder `NotificationService` exists but does not deliver notifications. |
| **Customer Web App** | §10 | ❌ **MISSING** | Placeholder Next.js app exists; no features implemented. |
| **Dashboard Web App** | §10 | ❌ **MISSING** | Placeholder Next.js app exists; no features implemented. |

---

## 4. Detailed Sprint Plan & Specifications

This section provides the complete technical specifications for every task required to reach MVP launch.

### Sprint 3: Core API Completion (Jan 5 - Jan 11)

*   **Goal:** Implement all remaining P0 backend functionality.
*   **Total Story Points:** 24

---

#### Task: [S3-01] Implement Categories API

*   **Description:** Create a public endpoint to list all product and service categories, supporting hierarchical data to allow clients to build navigation menus.
*   **Acceptance Criteria:**
    *   [ ] `GET /api/v1/categories` returns a 200 status with a list of all categories.
    *   [ ] The endpoint can be filtered by `type` (e.g., `?type=PRODUCT` or `?type=SERVICE`).
    *   [ ] The JSON response includes nested `children` for subcategories.
*   **Technical Specs:**
    *   **Database Models:** `Category` (existing).
    *   **API Endpoint:** `GET /api/v1/categories`
    *   **Request Query Params:** `type: 'PRODUCT' | 'SERVICE'` (optional).
    *   **Response Body:** `[{ id, name, slug, type, parentId, children: [...] }]`
*   **Story Points:** 2
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Unit and integration tests passing in CI.
    *   [ ] Endpoint returns a 200 with correct data on staging.

---

#### Task: [S3-02] Create Onboarding & Delivery DB Models

*   **Description:** Create the database models required for vendor/provider applications and for the driver/delivery system.
*   **Acceptance Criteria:**
    *   [ ] `VendorApplication` and `ProviderApplication` models are added to `schema.prisma`.
    *   [ ] `Driver` and `DeliveryAssignment` models are added to `schema.prisma`.
    *   [ ] A new Prisma migration is successfully generated and applied.
*   **Technical Specs:**
    *   **New Models:**
        *   `VendorApplication` (userId, businessName, crNumber, status, notes)
        *   `ProviderApplication` (userId, businessName, qualifications, status, notes)
        *   `Driver` (userId, vehicleType, licenseNumber, status)
        *   `DeliveryAssignment` (orderId, driverId, status, pickupTime, deliveryTime)
*   **Story Points:** 2
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] New migration file exists in `prisma/migrations`.
    *   [ ] `prisma migrate deploy` completes successfully in CI/CD.

---

#### Task: [S3-03] Implement Vendor & Provider Application APIs

*   **Description:** Create endpoints for users to submit and check the status of their vendor/provider applications.
*   **Acceptance Criteria:**
    *   [ ] Authenticated users can submit an application via `POST /api/v1/vendor-applications`.
    *   [ ] Authenticated users can submit an application via `POST /api/v1/provider-applications`.
    *   [ ] Users can view their own application status via `GET /api/v1/vendor-applications/me`.
*   **Technical Specs:**
    *   **Dependencies:** [S3-02]
    *   **API Endpoints:**
        *   `POST /api/v1/vendor-applications` (Body: `businessName`, `crNumber`, etc.)
        *   `POST /api/v1/provider-applications` (Body: `businessName`, `qualifications`, etc.)
        *   `GET /api/v1/vendor-applications/me`
        *   `GET /api/v1/provider-applications/me`
*   **Story Points:** 6
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Tests passing for submission and status checks.
    *   [ ] Endpoints are functional on staging.

---

#### Task: [S3-04] Implement Admin Application Review APIs

*   **Description:** Create endpoints for admins to list, view, approve, and reject applications.
*   **Acceptance Criteria:**
    *   [ ] Admins can list all pending applications via `GET /api/v1/admin/vendor-applications`.
    *   [ ] Admins can approve or reject an application via `PATCH /api/v1/admin/vendor-applications/:id`.
    *   [ ] Approving an application automatically creates a `Vendor` or `ServiceProvider` record and updates the `User` role.
*   **Technical Specs:**
    *   **Dependencies:** [S3-03]
    *   **API Endpoints:**
        *   `GET /api/v1/admin/vendor-applications`
        *   `PATCH /api/v1/admin/vendor-applications/:id` (Body: `{ status: 'APPROVED' | 'REJECTED', notes: '...' }`)
        *   (Similar endpoints for `provider-applications`)
*   **Story Points:** 3
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Tests verify that only admins can access and that status changes are processed correctly.
    *   [ ] Endpoints are functional on staging.

---

#### Task: [S3-05] Implement Admin Dashboard Stats API

*   **Description:** Create a secure endpoint for the admin dashboard to fetch high-level platform statistics.
*   **Acceptance Criteria:**
    *   [ ] `GET /api/v1/admin/stats` returns key platform metrics.
    *   [ ] Endpoint is accessible only by users with the `ADMIN` role.
    *   [ ] Stats include total users, vendors, providers, orders, and total revenue.
*   **Technical Specs:**
    *   **API Endpoint:** `GET /api/v1/admin/stats`
    *   **Response Body:** `{ users: { total, roles: {...} }, orders: { total, status: {...} }, revenue: { total, last30days } }`
*   **Story Points:** 3
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Tests verify admin-only access and correct data aggregation.
    *   [ ] Endpoint returns correct stats on staging.

---

#### Task: [S3-06] Implement Driver & Delivery APIs

*   **Description:** Create the core endpoints for driver management and delivery assignment.
*   **Acceptance Criteria:**
    *   [ ] Admins can manage drivers.
    *   [ ] An internal mechanism can assign a driver to a `READY` order, creating a `DeliveryAssignment`.
    *   [ ] Drivers can view and update the status of their assigned deliveries.
*   **Technical Specs:**
    *   **Dependencies:** [S3-02]
    *   **API Endpoints:**
        *   `POST /api/v1/admin/drivers` (Create a driver profile)
        *   `GET /api/v1/driver/deliveries` (Get assigned deliveries for current driver)
        *   `PATCH /api/v1/driver/deliveries/:id` (Body: `{ status: 'PICKED_UP' | 'DELIVERED' }`)
*   **Story Points:** 6
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Tests verify driver assignment and status updates.
    *   [ ] Endpoints are functional on staging.

---

### Sprint 3.8: UI Foundation (Jan 6-8) - 🚧 IN PROGRESS

| Task ID | Description | SP | Status |
|:---|:---|:---:|:---|
| S3.8-01 | Create Design Tokens (`tokens.css`) | 3 | ✅ Done |
| S3.8-02 | Create Copy Tokens (`ar.ts`, `en.ts`) | 4 | ✅ Done |
| S3.8-03 | Add Vazirmatn Fonts | 1 | ✅ Done |
| S3.8-04 | Create UI Law Document | 2 | ✅ Done |
| S3.8-05 | Create BRAND_VOICE.md | 1 | ✅ Done |
| S3.8-06 | Create Component Specs (12 Core) | 3 | ✅ Done |
| S3.8-07 | Create CI Lint Rules | 3 | ✅ Done |
| S3.8-08 | Update All Documentation Links | 2 | 🚧 In Progress |
| S3.8-09 | Manus Audit & Gap Analysis | 2 | 🚧 In Progress |

---

### Sprint 4: Frontend Foundation & Auth (Jan 12 - Jan 18)

*   **Goal:** Build the foundational UI/UX and implement the complete authentication flow for both web apps.
*   **Total Story Points:** 24

---

#### Task: [S4-01] Setup Design System & Shared UI

*   **Description:** Create a library of shared React components based on the design system to ensure UI consistency.
*   **Acceptance Criteria:**
    *   [x] `packages/ui` contains reusable components for Buttons, Inputs, Modals, etc.
    *   [x] Tailwind CSS theme is configured with project colors, fonts, and spacing.
    *   [x] Storybook is set up to visualize and test components in isolation.
*   **Technical Specs:**
    *   **UI Screens:** N/A (component library)
    *   **Dependencies:** None
*   **Story Points:** 8
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Storybook is deployed and accessible on staging.

---

#### Task: [S4-02] Implement Customer Phone + OTP Login Flow

*   **Description:** Build the complete, user-facing authentication flow for the customer web app.
*   **Acceptance Criteria:**
    *   [x] User can enter a phone number on the login page.
    *   [x] User receives an OTP via SMS/WhatsApp.
    *   [x] User enters the OTP to log in and receive a JWT.
*   **Technical Specs:**
    *   **UI Screens:** Login, Verify OTP
    *   **Dependencies:** [S4-01], Sprint 3 (Auth API)
*   **Story Points:** 5
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] E2E test for login passes.
    *   [ ] Login flow is fully functional on `nasneh.com` (staging).

---

#### Task: [S4-03] Implement Customer Profile & Address Management

*   **Description:** Build the UI for authenticated customers to manage their profile and addresses.
*   **Acceptance Criteria:**
    *   [x] Logged-in users can view and edit their profile information (name, email).
    *   [x] Users can add, view, edit, and delete their delivery addresses.
*   **Technical Specs:**
    *   **UI Screens:** My Profile, My Addresses, Add/Edit Address
    *   **Dependencies:** [S4-02]
*   **Story Points:** 5
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Profile and address changes are correctly saved and reflected.

---

#### Task: [S4-04] Implement Dashboard Login & Role Switching

*   **Description:** Build the authentication and role selection mechanism for the dashboard.
*   **Acceptance Criteria:**
    *   [x] Users can log in to `dashboard.nasneh.com` using the same OTP flow.
    *   [x] After login, if a user has multiple roles (e.g., Vendor, Admin), they are prompted to select which dashboard to view.
*   **Technical Specs:**
    *   **UI Screens:** Dashboard Login, Role Selector
    *   **Dependencies:** [S4-01], Sprint 3 (Auth API)
*   **Story Points:** 6
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [x] Users with multiple roles can successfully switch between dashboards.

---

### Sprint 5: Frontend Core Features (Jan 19 - Jan 25)

*   **Goal:** Implement the core product/service browsing, ordering, and application functionality.
*   **Total Story Points:** 32

---

#### Task: [S5-01] Implement Category & Product/Service Browsing

*   **Description:** Build the main browsing interface for the customer web app.
*   **Acceptance Criteria:**
    *   [ ] Homepage displays featured vendors and providers.
    *   [ ] Users can navigate through categories and subcategories.
    *   [ ] Product/Service listing pages include search and filtering.
    *   [ ] Users can view detailed product/service pages.
*   **Technical Specs:**
    *   **UI Screens:** Home, Category, Product/Service List, Product/Service Detail
    *   **Dependencies:** [S4-01], [S3-01]
*   **Story Points:** 8
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] All browsing pages are functional on staging.

---

#### Task: [S5-02] Implement Product Order Flow (Cart & Checkout)

*   **Description:** Build the complete flow for a customer to order a product.
*   **Acceptance Criteria:**
    *   [ ] Users can add products to a single-vendor cart.
    *   [ ] Users can view and modify their cart.
    *   [ ] Users can proceed to checkout, select an address, and complete payment via APS.
*   **Technical Specs:**
    *   **UI Screens:** Cart, Checkout, Payment, Order Confirmation
    *   **Dependencies:** [S5-01], Sprint 3 (Cart & Order APIs)
*   **Story Points:** 8
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] A full, end-to-end order can be successfully placed on staging.

---

#### Task: [S5-03] Implement Service Booking Flow

*   **Description:** Build the UI for a customer to book a service.
*   **Acceptance Criteria:**
    *   [ ] Users can select a time slot or delivery date from a provider's availability calendar.
    *   [ ] Users can complete the booking and payment flow.
*   **Technical Specs:**
    *   **UI Screens:** Service Booking, Checkout, Booking Confirmation
    *   **Dependencies:** [S5-01], Sprint 3 (Booking API)
*   **Story Points:** 6
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] A service can be successfully booked on staging.

---

#### Task: [S5-04] Implement Vendor/Provider Onboarding Forms

*   **Description:** Build the forms in the dashboard for users to apply to become vendors or providers.
*   **Acceptance Criteria:**
    *   [ ] A "Become a Vendor/Provider" section is available in the dashboard.
    *   [ ] Forms correctly capture all required information and submit to the API.
*   **Technical Specs:**
    *   **UI Screens:** Onboarding Application Form
    *   **Dependencies:** [S4-04], [S3-03]
*   **Story Points:** 6
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Applications can be successfully submitted from the staging dashboard.

---

#### Task: [S5-05] Implement Admin Application Review UI

*   **Description:** Build the interface for admins to review and manage applications.
*   **Acceptance Criteria:**
    *   [ ] Admins can see a list of pending applications in their dashboard.
    *   [ ] Admins can view application details and approve or reject them.
*   **Technical Specs:**
    *   **UI Screens:** Admin Application List, Admin Application Detail
    *   **Dependencies:** [S4-04], [S3-04]
*   **Story Points:** 4
*   **Evidence of Completion:**
    *   [x] Code merged to `main`.
    *   [ ] Admins can successfully approve a vendor on staging.

---

### Pre-Launch / UAT Week (Jan 26 - Feb 1)

*   **Goal:** Finalize infrastructure, complete integrations, and conduct internal testing.

---

#### Task: [UAT-01] Configure Production Domains & SSL

*   **Description:** Set up DNS and SSL certificates for all production domains.
*   **Acceptance Criteria:**
    *   [ ] `nasneh.com`, `dashboard.nasneh.com`, and `api.nasneh.com` are configured in Route 53.
    *   [ ] Valid SSL certificates are provisioned and enforced (HTTPS redirect).
*   **Story Points:** 3

---

#### Task: [UAT-02] Implement API Rate Limiting & Final Security

*   **Description:** Implement security measures to protect the API from abuse.
*   **Acceptance Criteria:**
    *   [ ] Rate limiting is applied to sensitive endpoints (e.g., login, order creation).
    *   [ ] CORS policy is tightened to only allow production frontend domains.
*   **Story Points:** 4

---

#### Task: [UAT-03] Implement SMS & WhatsApp Notifications

*   **Description:** Replace the placeholder `NotificationService` with a real implementation using AWS SNS.
*   **Acceptance Criteria:**
    *   [ ] Users receive an OTP via SMS or WhatsApp upon login request.
    *   [ ] Users receive order/booking status updates via notifications.
*   **Story Points:** 6

---

#### Task: [UAT-04] User Acceptance Testing (UAT) & Bug Fixing

*   **Description:** Conduct a full, internal UAT cycle to find and fix bugs before launch.
*   **Acceptance Criteria:**
    *   [ ] A team of 5-10 internal testers performs scripted and unscripted testing.
    *   [ ] All P0 and P1 bugs identified are fixed and verified.
*   **Story Points:** 10 (variable)

---

## 5. Timeline to MVP Launch

| Sprint / Phase | Start Date | End Date | Duration | Key Goal |
|:---|:---:|:---:|:---:|:---|
| **Sprint 3** | Jan 5, 2026 | Jan 11, 2026 | 1 Week | Complete Backend APIs |
| **Sprint 4** | Jan 12, 2026 | Jan 18, 2026 | 1 Week | Frontend Foundation & Auth |
| **Sprint 5** | Jan 19, 2026 | Jan 25, 2026 | 1 Week | Frontend Core Features |
| **UAT & Bug Bash** | Jan 26, 2026 | Feb 1, 2026 | 1 Week | Internal testing, bug fixing, final polish |
| **MVP LAUNCH** | **Feb 2, 2026** | - | - | **Go Live in Bahrain** |

---

## 6. ClickUp Structure Recommendation

To effectively manage this roadmap, the following ClickUp structure is recommended:

*   **Folder:** `MVP Development`
*   **Lists:**
    *   `Sprint 3: Core API`
    *   `Sprint 4: Frontend Foundation`
    *   `Sprint 5: Frontend Features`
    *   `Pre-Launch / UAT`
*   **Tasks:** Each task from this document should be a separate task in the corresponding list.
*   **Custom Fields:**
    *   `Story Points` (Number)
    *   `Sprint` (Dropdown: Sprint 3, Sprint 4, etc.)
    *   `Epic` (Link to a parent "MVP Launch" task)
*   **Labels/Tags:**
    *   `backend`, `frontend`, `infra`
    *   `bug`, `feature`, `chore`
    *   `p0`, `p1`, `p2` (for bug priority)

---

## 7. Risk Mitigation

| Sprint | Potential Risk | Mitigation Plan |
|:---|:---|:---|
| **Sprint 3** | **API Complexity:** Implementing onboarding and delivery logic is complex. | **Plan:** The 6-point estimates for these tasks include a buffer. If a task exceeds its estimate, we can move a lower-priority task (e.g., Admin Stats) to Sprint 4. |
| **Sprint 4** | **Design System Delays:** Building a component library can be time-consuming. | **Plan:** Focus on essential components first (Button, Input, Card). Defer more complex components (e.g., Date Picker) to be built as needed in Sprint 5. |
| **Sprint 5** | **E2E Flow Integration Bugs:** Connecting the frontend to the backend will reveal bugs. | **Plan:** Budget time for integration testing within each task. The UAT week is the primary buffer for fixing cross-system bugs. |
| **UAT Week** | **Critical Bug Discovery:** A major bug is found that requires significant rework. | **Plan:** If a P0 bug is found, the launch date will be pushed back by one week. This is a non-negotiable quality gate. We can create a "Sprint 5.5" to address this. |

---

## 8. References

[1] Pre-Sprint 3 Comprehensive Audit Report (`docs/AUDITS/AUDIT_2026-01-04_PRE-SPRINT3.md`)  
[2] Final System Verification Report (`docs/AUDITS/VERIFICATION_2026-01-04_PRE-SPRINT3.md`)

---

*Generated by Manus AI — January 4, 2026*
