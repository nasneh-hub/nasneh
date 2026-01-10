# Changelog

All notable changes to the Nasneh project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### ♻️ Refactors (refactor)
- **#255:** remove all remaining inline styles from customer-web
- **#254:** remove all inline styles from header, footer, and placeholder pages

### 📝 Other
- **#230:** use config.environment instead of config.env
- **#228:** add logging to diagnose OTP test number issue

### 🐛 Bug Fixes (fix)
- **#250:** remove nested p tag causing hydration error
- **#248:** remove dead UI elements (globe/theme/hamburger)
- **#244:** implement route groups and fix avatar dropdown menu
- **#239:** use ar.profile.myProfile instead of non-existent ar.profile.title
- **#237:** map verify-otp API response to frontend format
- **#235:** configure CORS for staging frontends
- **#234:** add build args for NEXT_PUBLIC environment variables
- **#232:** correct API URL for ECS customer-web to include /api/v1
- **#231:** correct API URL in staging to include /api/v1 path
- **#227:** update staging test phone number to valid Bahrain mobile
- **#225:** add public directories for Docker build
- **#224:** add standalone output mode for Docker deployment
- **#223:** copy entire deps stage to preserve all node_modules
- **#222:** copy per-package node_modules from deps stage
- **#221:** preserve workspace structure in builder stage

### ✨ Features (feat)
- **#270:** add booking page steps 1-2 with slots API integration
- **#269:** add booking components and copy tokens
- **#267:** add order confirmation page with mock payment adapter for S5-02 PR5
- **#266:** add checkout page with API integration for S5-02 PR4
- **#265:** add checkout components for S5-02 PR3
- **#264:** add cart page with API integration for S5-02 PR2
- **#263:** add cart components for S5-02 PR1
- **#262:** add cart/checkout/order copy tokens for S5-02
- **#261:** add RadioGroup and Textarea components
- **#260:** Add reviews section to product and service detail pages (PR3-C)
- **#259:** implement service detail page
- **#258:** add product detail page
- **#257:** implement listing pages with filters, sort, and pagination
- **#256:** implement home, categories, and search pages
- **#253:** integrate NavigationMenu into header with centered desktop navigation
- **#252:** add NavigationMenu component to @nasneh/ui (PR4-A)
- **#251:** add Globe dropdown for language/currency/country settings
- **#249:** implement theme toggle with next-themes
- **#247:** complete profile area with API integration + fix footer hardcoded text
- **#246:** UI corrections - English LTR, country switcher, Go Back button
- **#245:** UI corrections + standardization
- **#243:** implement unified UI Philosophy with Airbnb-style header
- **#241:** add shadcn variables mapped to Nasneh Nature palette
- **#238:** add post-login app shell with navigation
- **#229:** bypass rate limit for test numbers in staging
- **#226:** add DNS and TLS for frontend apps with SNI
- **#219:** add Terraform Amplify module for frontend apps
- **#218:** add amplify.yml build configs for frontend apps
- **#217:** enable HTTPS on ALB and add dashboard next.config.js
- **#216:** add ACM certificate and Route53 for api-staging.nasneh.com

### 📚 Documentation (docs)
- **#268:** add S5-02 E2E smoke test audit for PR6
- **#240:** relax to shadcn-first approach (v2.0)
- **#215:** add environment variables contract

---

## [0.4.0] - 2026-01-08

### ♻️ Refactors (refactor)
- **#255:** remove all remaining inline styles from customer-web
- **#207:** remove localStorage workaround

### 📚 Documentation (docs)
- **#268:** add S5-02 E2E smoke test audit for PR6
- **#240:** relax to shadcn-first approach (v2.0)
- **#214:** update documentation for Sprint 4 completion
- **#201:** add modification rules to tokens.css

### ✨ Features (feat)
- **#270:** add booking page steps 1-2 with slots API integration
- **#269:** add booking components and copy tokens
- **#267:** add order confirmation page with mock payment adapter for S5-02 PR5
- **#266:** add checkout page with API integration for S5-02 PR4
- **#265:** add checkout components for S5-02 PR3
- **#264:** add cart page with API integration for S5-02 PR2
- **#263:** add cart components for S5-02 PR1
- **#262:** add cart/checkout/order copy tokens for S5-02
- **#261:** add RadioGroup and Textarea components
- **#260:** Add reviews section to product and service detail pages (PR3-C)
- **#259:** implement service detail page
- **#258:** add product detail page
- **#257:** implement listing pages with filters, sort, and pagination
- **#256:** implement home, categories, and search pages
- **#253:** integrate NavigationMenu into header with centered desktop navigation
- **#252:** add NavigationMenu component to @nasneh/ui (PR4-A)
- **#251:** add Globe dropdown for language/currency/country settings
- **#249:** implement theme toggle with next-themes
- **#247:** complete profile area with API integration + fix footer hardcoded text
- **#246:** UI corrections - English LTR, country switcher, Go Back button
- **#245:** UI corrections + standardization
- **#243:** implement unified UI Philosophy with Airbnb-style header
- **#241:** add shadcn variables mapped to Nasneh Nature palette
- **#238:** add post-login app shell with navigation
- **#229:** bypass rate limit for test numbers in staging
- **#226:** add DNS and TLS for frontend apps with SNI
- **#219:** add Terraform Amplify module for frontend apps
- **#218:** add amplify.yml build configs for frontend apps
- **#217:** enable HTTPS on ALB and add dashboard next.config.js
- **#210:** add login and role switching flow
- **#208:** add profile and address management pages
- **#204:** implement phone + OTP login flow
- **#203:** add remaining 6 core components
- **#199:** add 6 core components (Button, Input, Card, Badge, Skeleton, Dialog)

### 🐛 Bug Fixes (fix)
- **#250:** remove nested p tag causing hydration error
- **#248:** remove dead UI elements (globe/theme/hamburger)
- **#244:** implement route groups and fix avatar dropdown menu
- **#239:** use ar.profile.myProfile instead of non-existent ar.profile.title
- **#237:** map verify-otp API response to frontend format
- **#235:** configure CORS for staging frontends
- **#234:** add build args for NEXT_PUBLIC environment variables
- **#232:** correct API URL for ECS customer-web to include /api/v1
- **#231:** correct API URL in staging to include /api/v1 path
- **#227:** update staging test phone number to valid Bahrain mobile
- **#225:** add public directories for Docker build
- **#224:** add standalone output mode for Docker deployment
- **#223:** copy entire deps stage to preserve all node_modules
- **#222:** copy per-package node_modules from deps stage
- **#213:** restore proper workflow structure with comment exclusions
- **#212:** improve forbidden terminology exclusions for comments and ro…
- **#211:** exclude route paths and TypeScript keys from forbidden termi…
- **#209:** exclude Arabic punctuation from hardcoded text check
- **#206:** add word boundaries to UI Law regex patterns
- **#200:** scope ui-lint to frontend files only, eliminate false positives

---

---


## [0.3.5] - 2026-01-07

### ✨ Features (feat)
- **#270:** add booking page steps 1-2 with slots API integration
- **#269:** add booking components and copy tokens
- **#267:** add order confirmation page with mock payment adapter for S5-02 PR5
- **#266:** add checkout page with API integration for S5-02 PR4
- **#265:** add checkout components for S5-02 PR3
- **#264:** add cart page with API integration for S5-02 PR2
- **#263:** add cart components for S5-02 PR1
- **#262:** add cart/checkout/order copy tokens for S5-02
- **#261:** add RadioGroup and Textarea components
- **#260:** Add reviews section to product and service detail pages (PR3-C)
- **#259:** implement service detail page
- **#258:** add product detail page
- **#257:** implement listing pages with filters, sort, and pagination
- **#256:** implement home, categories, and search pages
- **#253:** integrate NavigationMenu into header with centered desktop navigation
- **#252:** add NavigationMenu component to @nasneh/ui (PR4-A)
- **#251:** add Globe dropdown for language/currency/country settings
- **#249:** implement theme toggle with next-themes
- **#247:** complete profile area with API integration + fix footer hardcoded text
- **#246:** UI corrections - English LTR, country switcher, Go Back button
- **#245:** UI corrections + standardization
- **#243:** implement unified UI Philosophy with Airbnb-style header
- **#241:** add shadcn variables mapped to Nasneh Nature palette
- **#238:** add post-login app shell with navigation
- **#229:** bypass rate limit for test numbers in staging
- **#226:** add DNS and TLS for frontend apps with SNI
- **#219:** add Terraform Amplify module for frontend apps
- **#218:** add amplify.yml build configs for frontend apps
- **#217:** enable HTTPS on ALB and add dashboard next.config.js
- **#210:** add login and role switching flow
- **#208:** add profile and address management pages
- **#204:** implement phone + OTP login flow
- **#203:** add remaining 6 core components
- **#190:** add OTP mock mode for staging

### 🐛 Bug Fixes (fix)
- **#250:** remove nested p tag causing hydration error
- **#248:** remove dead UI elements (globe/theme/hamburger)
- **#244:** implement route groups and fix avatar dropdown menu
- **#239:** use ar.profile.myProfile instead of non-existent ar.profile.title
- **#237:** map verify-otp API response to frontend format
- **#235:** configure CORS for staging frontends
- **#234:** add build args for NEXT_PUBLIC environment variables
- **#232:** correct API URL for ECS customer-web to include /api/v1
- **#231:** correct API URL in staging to include /api/v1 path
- **#227:** update staging test phone number to valid Bahrain mobile
- **#225:** add public directories for Docker build
- **#224:** add standalone output mode for Docker deployment
- **#223:** copy entire deps stage to preserve all node_modules
- **#222:** copy per-package node_modules from deps stage
- **#213:** restore proper workflow structure with comment exclusions
- **#212:** improve forbidden terminology exclusions for comments and ro…
- **#211:** exclude route paths and TypeScript keys from forbidden termi…
- **#209:** exclude Arabic punctuation from hardcoded text check
- **#206:** add word boundaries to UI Law regex patterns
- **#197:** add authMiddleware to 4 modules (addresses, bookings, cart, reviews)
- **#196:** add authMiddleware to users routes
- **#194:** use ESM import for crypto in token repository
- **#193:** return 400 for invalid OTP and use fixed OTP for test number in staging
- **#192:** add missing getBookingById function
- **#191:** use ENVIRONMENT variable for OTP mock mode safety check
- **#189:** remove waitForDelivery to prevent OTP timeout
- **#187:** remove accidental bash command from ui-lint.yml

### 📚 Documentation (docs)
- **#268:** add S5-02 E2E smoke test audit for PR6
- **#240:** relax to shadcn-first approach (v2.0)
- **#214:** update documentation for Sprint 4 completion
- **#198:** complete API inventory with all 78 endpoints tested
- **#195:** document Sprint 3.9 infrastructure fixes and lessons learned
- **#188:** add API route inventory and update API reference
- **#186:** update project status and add missing links

---

---


## [0.3.0] - 2026-01-06

### 🔧 Chores (chore)
- **#184:** remove temporary files from root

### 🚀 CI/CD (ci)
- **#181:** add UI Law enforcement workflow
- **#145:** install Phase 6 automation
- **#144:** add dependabot, release notes, labels, stale bot, and PR size check
- **#142:** switch to unified auto-docs workflow

### ✨ Features (feat)
- **#270:** add booking page steps 1-2 with slots API integration
- **#269:** add booking components and copy tokens
- **#267:** add order confirmation page with mock payment adapter for S5-02 PR5
- **#266:** add checkout page with API integration for S5-02 PR4
- **#265:** add checkout components for S5-02 PR3
- **#264:** add cart page with API integration for S5-02 PR2
- **#263:** add cart components for S5-02 PR1
- **#262:** add cart/checkout/order copy tokens for S5-02
- **#261:** add RadioGroup and Textarea components
- **#260:** Add reviews section to product and service detail pages (PR3-C)
- **#259:** implement service detail page
- **#258:** add product detail page
- **#257:** implement listing pages with filters, sort, and pagination
- **#256:** implement home, categories, and search pages
- **#253:** integrate NavigationMenu into header with centered desktop navigation
- **#252:** add NavigationMenu component to @nasneh/ui (PR4-A)
- **#251:** add Globe dropdown for language/currency/country settings
- **#249:** implement theme toggle with next-themes
- **#247:** complete profile area with API integration + fix footer hardcoded text
- **#246:** UI corrections - English LTR, country switcher, Go Back button
- **#245:** UI corrections + standardization
- **#243:** implement unified UI Philosophy with Airbnb-style header
- **#241:** add shadcn variables mapped to Nasneh Nature palette
- **#238:** add post-login app shell with navigation
- **#229:** bypass rate limit for test numbers in staging
- **#226:** add DNS and TLS for frontend apps with SNI
- **#219:** add Terraform Amplify module for frontend apps
- **#218:** add amplify.yml build configs for frontend apps
- **#217:** enable HTTPS on ALB and add dashboard next.config.js
- **#210:** add login and role switching flow
- **#208:** add profile and address management pages
- **#204:** implement phone + OTP login flow
- **#203:** add remaining 6 core components
- **#177:** Vazirmatn Font Files - S3.8-03
- **#176:** Copy Tokens (ar/en/terminology) - S3.8-02
- **#175:** Design Tokens (tokens.css) - S3.8-01
- **#172:** implement driver and delivery APIs
- **#171:** implement admin dashboard stats API
- **#170:** implement admin application review APIs
- **#169:** implement vendor and provider application APIs
- **#168:** add onboarding and delivery models
- **#167:** implement categories API

### 🐛 Bug Fixes (fix)
- **#250:** remove nested p tag causing hydration error
- **#248:** remove dead UI elements (globe/theme/hamburger)
- **#244:** implement route groups and fix avatar dropdown menu
- **#239:** use ar.profile.myProfile instead of non-existent ar.profile.title
- **#237:** map verify-otp API response to frontend format
- **#235:** configure CORS for staging frontends
- **#234:** add build args for NEXT_PUBLIC environment variables
- **#232:** correct API URL for ECS customer-web to include /api/v1
- **#231:** correct API URL in staging to include /api/v1 path
- **#227:** update staging test phone number to valid Bahrain mobile
- **#225:** add public directories for Docker build
- **#224:** add standalone output mode for Docker deployment
- **#223:** copy entire deps stage to preserve all node_modules
- **#222:** copy per-package node_modules from deps stage
- **#213:** restore proper workflow structure with comment exclusions
- **#212:** improve forbidden terminology exclusions for comments and ro…
- **#211:** exclude route paths and TypeScript keys from forbidden termi…
- **#209:** exclude Arabic punctuation from hardcoded text check
- **#206:** add word boundaries to UI Law regex patterns
- **#197:** add authMiddleware to 4 modules (addresses, bookings, cart, reviews)
- **#196:** add authMiddleware to users routes
- **#194:** use ESM import for crypto in token repository
- **#193:** return 400 for invalid OTP and use fixed OTP for test number in staging
- **#192:** add missing getBookingById function
- **#191:** use ENVIRONMENT variable for OTP mock mode safety check
- **#189:** remove waitForDelivery to prevent OTP timeout
- **#141:** merge changelog and timeline into unified auto-docs workflow

### 📚 Documentation (docs)
- **#268:** add S5-02 E2E smoke test audit for PR6
- **#240:** relax to shadcn-first approach (v2.0)
- **#214:** update documentation for Sprint 4 completion
- **#198:** complete API inventory with all 78 endpoints tested
- **#195:** document Sprint 3.9 infrastructure fixes and lessons learned
- **#188:** add API route inventory and update API reference
- **#182:** comprehensive documentation audit and gap fixes
- **#180:** add Component Specifications for 12 core components
- **#179:** Brand Voice Document - S3.8-05
- **#178:** UI Law Document - S3.8-04
- **#174:** Sprint 3 completion report and AWS permissions
- **#173:** complete Sprint 3 verification and documentation
- **#166:** add Master Roadmap links across all documentation
- **#165:** add master roadmap with complete sprint specifications
- **#164:** comprehensive pre-sprint 3 project audit
- **#163:** add pending Dependabot updates to memory
- **#162:** phase 7 cleanup and verification
- **#132:** Final manual update of memory files (pending)

### 🏗️ Infrastructure (infra)

### 🧪 Tests (test)
- **#143:** verify unified auto-docs workflow
- **#140:** automation test v3 after APP_ID fix

### ⚙️ Refactors (refactor)

---

## [0.2.0] - 2026-01-03

### 📚 Documentation (docs)
- **#268:** add S5-02 E2E smoke test audit for PR6
- **#240:** relax to shadcn-first approach (v2.0)
- **#214:** update documentation for Sprint 4 completion
- **#198:** complete API inventory with all 78 endpoints tested
- **#195:** document Sprint 3.9 infrastructure fixes and lessons learned
- **#188:** add API route inventory and update API reference
- **#182:** comprehensive documentation audit and gap fixes
- **#180:** add Component Specifications for 12 core components
- **#179:** Brand Voice Document - S3.8-05
- **#178:** UI Law Document - S3.8-04
- **#174:** Sprint 3 completion report and AWS permissions
- **#173:** complete Sprint 3 verification and documentation
- **#166:** add Master Roadmap links across all documentation
- **#165:** add master roadmap with complete sprint specifications
- **#164:** comprehensive pre-sprint 3 project audit
- **#163:** add pending Dependabot updates to memory
- **#162:** phase 7 cleanup and verification
- **#131:** Establish AI Governance System with Folder Structure
- **#130:** Comprehensive /docs Audit Report
- **#128:** Comprehensive API audit report for Sprint 1 & 2
- **#127:** Comprehensive CD stabilization and database migration documentation

### 🐛 Bug Fixes (fix)
- **#250:** remove nested p tag causing hydration error
- **#248:** remove dead UI elements (globe/theme/hamburger)
- **#244:** implement route groups and fix avatar dropdown menu
- **#239:** use ar.profile.myProfile instead of non-existent ar.profile.title
- **#237:** map verify-otp API response to frontend format
- **#235:** configure CORS for staging frontends
- **#234:** add build args for NEXT_PUBLIC environment variables
- **#232:** correct API URL for ECS customer-web to include /api/v1
- **#231:** correct API URL in staging to include /api/v1 path
- **#227:** update staging test phone number to valid Bahrain mobile
- **#225:** add public directories for Docker build
- **#224:** add standalone output mode for Docker deployment
- **#223:** copy entire deps stage to preserve all node_modules
- **#222:** copy per-package node_modules from deps stage
- **#213:** restore proper workflow structure with comment exclusions
- **#212:** improve forbidden terminology exclusions for comments and ro…
- **#211:** exclude route paths and TypeScript keys from forbidden termi…
- **#209:** exclude Arabic punctuation from hardcoded text check
- **#206:** add word boundaries to UI Law regex patterns
- **#197:** add authMiddleware to 4 modules (addresses, bookings, cart, reviews)
- **#196:** add authMiddleware to users routes
- **#194:** use ESM import for crypto in token repository
- **#193:** return 400 for invalid OTP and use fixed OTP for test number in staging
- **#192:** add missing getBookingById function
- **#191:** use ENVIRONMENT variable for OTP mock mode safety check
- **#189:** remove waitForDelivery to prevent OTP timeout
- **#141:** merge changelog and timeline into unified auto-docs workflow
- **#129:** Mount payment routes in main application
- **#126:** Update prisma path after removing --prod flag
- **#125:** Remove --prod flag to include prisma CLI in production image
- **#124:** Move prisma to dependencies for production migrations
- **#123:** Correct prisma binary path in migration script
- **#122:** Fix migration script to use local prisma binary
- **#120:** Change Prisma provider from MySQL to PostgreSQL
- **#119:** Update CD workflow paths to match new Dockerfile
- **#118:** Resolve Docker build Prisma client initialization (complete solution)
- **#117:** Resolve Prisma ESM imports and Docker build compilation
- **#116:** Comprehensive Prisma ESM import fixes for all remaining modules
- **#115:** Resolve Prisma ESM compatibility and Decimal type issues
- **#114:** Generate prisma client inside deployed bundle for runtime availability
- **#113:** Use valid 32-char JWT_SECRET for health check verification
- **#112:** Restore /app/apps/api structure in docker image for compatibility
- **#111:** Add body-parser dependency and use pnpm deploy for self-contained docker image
- **#110:** Final comprehensive prisma named imports fix for ESM compatibility
- **#109:** Comprehensive prisma named imports fix for ESM compatibility
- **#108:** Fix TypeScript errors in bookings.repository.ts
- **#107:** Prisma cjs import for Prisma/BookingStatus in bookings repo
- **#106:** Use default import for @prisma/client CJS module
- **#105:** Add explicit .js extensions for Node ESM compatibility
- **#104:** Add --experimental-specifier-resolution=node for ESM imports
- **#103:** Capture startup crash logs in health verify step
- **#102:** Dereference pnpm symlinks using tar for self-contained image

### ✨ Features (feat)
- **#270:** add booking page steps 1-2 with slots API integration
- **#269:** add booking components and copy tokens
- **#267:** add order confirmation page with mock payment adapter for S5-02 PR5
- **#266:** add checkout page with API integration for S5-02 PR4
- **#265:** add checkout components for S5-02 PR3
- **#264:** add cart page with API integration for S5-02 PR2
- **#263:** add cart components for S5-02 PR1
- **#262:** add cart/checkout/order copy tokens for S5-02
- **#261:** add RadioGroup and Textarea components
- **#260:** Add reviews section to product and service detail pages (PR3-C)
- **#259:** implement service detail page
- **#258:** add product detail page
- **#257:** implement listing pages with filters, sort, and pagination
- **#256:** implement home, categories, and search pages
- **#253:** integrate NavigationMenu into header with centered desktop navigation
- **#252:** add NavigationMenu component to @nasneh/ui (PR4-A)
- **#251:** add Globe dropdown for language/currency/country settings
- **#249:** implement theme toggle with next-themes
- **#247:** complete profile area with API integration + fix footer hardcoded text
- **#246:** UI corrections - English LTR, country switcher, Go Back button
- **#245:** UI corrections + standardization
- **#243:** implement unified UI Philosophy with Airbnb-style header
- **#241:** add shadcn variables mapped to Nasneh Nature palette
- **#238:** add post-login app shell with navigation
- **#229:** bypass rate limit for test numbers in staging
- **#226:** add DNS and TLS for frontend apps with SNI
- **#219:** add Terraform Amplify module for frontend apps
- **#218:** add amplify.yml build configs for frontend apps
- **#217:** enable HTTPS on ALB and add dashboard next.config.js
- **#210:** add login and role switching flow
- **#208:** add profile and address management pages
- **#204:** implement phone + OTP login flow
- **#203:** add remaining 6 core components
- **#177:** Vazirmatn Font Files - S3.8-03
- **#176:** Copy Tokens (ar/en/terminology) - S3.8-02
- **#175:** Design Tokens (tokens.css) - S3.8-01
- **#172:** implement driver and delivery APIs
- **#171:** implement admin dashboard stats API
- **#170:** implement admin application review APIs
- **#169:** implement vendor and provider application APIs
- **#168:** add onboarding and delivery models
- **#167:** implement categories API
- **#121:** Add database migrations and automation

---

## [0.1.0] - 2026-01-02

### ✨ Features (feat)
- **#270:** add booking page steps 1-2 with slots API integration
- **#269:** add booking components and copy tokens
- **#267:** add order confirmation page with mock payment adapter for S5-02 PR5
- **#266:** add checkout page with API integration for S5-02 PR4
- **#265:** add checkout components for S5-02 PR3
- **#264:** add cart page with API integration for S5-02 PR2
- **#263:** add cart components for S5-02 PR1
- **#262:** add cart/checkout/order copy tokens for S5-02
- **#261:** add RadioGroup and Textarea components
- **#260:** Add reviews section to product and service detail pages (PR3-C)
- **#259:** implement service detail page
- **#258:** add product detail page
- **#257:** implement listing pages with filters, sort, and pagination
- **#256:** implement home, categories, and search pages
- **#253:** integrate NavigationMenu into header with centered desktop navigation
- **#252:** add NavigationMenu component to @nasneh/ui (PR4-A)
- **#251:** add Globe dropdown for language/currency/country settings
- **#249:** implement theme toggle with next-themes
- **#247:** complete profile area with API integration + fix footer hardcoded text
- **#246:** UI corrections - English LTR, country switcher, Go Back button
- **#245:** UI corrections + standardization
- **#243:** implement unified UI Philosophy with Airbnb-style header
- **#241:** add shadcn variables mapped to Nasneh Nature palette
- **#238:** add post-login app shell with navigation
- **#229:** bypass rate limit for test numbers in staging
- **#226:** add DNS and TLS for frontend apps with SNI
- **#219:** add Terraform Amplify module for frontend apps
- **#218:** add amplify.yml build configs for frontend apps
- **#217:** enable HTTPS on ALB and add dashboard next.config.js
- **#210:** add login and role switching flow
- **#208:** add profile and address management pages
- **#204:** implement phone + OTP login flow
- **#203:** add remaining 6 core components
- **#177:** Vazirmatn Font Files - S3.8-03
- **#176:** Copy Tokens (ar/en/terminology) - S3.8-02
- **#175:** Design Tokens (tokens.css) - S3.8-01
- **#172:** implement driver and delivery APIs
- **#171:** implement admin dashboard stats API
- **#170:** implement admin application review APIs
- **#169:** implement vendor and provider application APIs
- **#168:** add onboarding and delivery models
- **#167:** implement categories API
- **#66:** Implement review CRUD API with RBAC
- **#64:** Implement single-vendor cart API
- **#63:** Implement address management CRUD with RBAC
- **#62:** Implement user profile CRUD with RBAC
- **#61:** Implement booking listing APIs with role-based visibility
- **#60:** Implement booking status flow with state machine
- **#59:** Implement atomic double-booking prevention
- **#57:** Implement create booking endpoint
- **#55:** Add conflict validation guardrails
- **#52:** Availability schema + rules
- **#50:** Implement service listing API
- **#48:** Implement service CRUD API
- **#45:** Create services table migration
- **#46:** Create bookings table migration
- **#42:** Implement APS webhook handler
- **#41:** Implement APS payment initiation
- **#40:** Create payments and refunds tables migration
- **#39:** Implement create order endpoint
- **#38:** Implement order status flow with audit logging
- **#37:** Create orders and order_items tables migration
- **#36:** Implement product image upload to S3
- **#35:** Implement product CRUD API
- **#25:** Create products, vendors, categories schema and repositories
- **#24:** Implement refresh token flow with Redis storage
- **#22:** Implement SMS fallback via AWS SNS

### 🐛 Bug Fixes (fix)
- **#250:** remove nested p tag causing hydration error
- **#248:** remove dead UI elements (globe/theme/hamburger)
- **#244:** implement route groups and fix avatar dropdown menu
- **#239:** use ar.profile.myProfile instead of non-existent ar.profile.title
- **#237:** map verify-otp API response to frontend format
- **#235:** configure CORS for staging frontends
- **#234:** add build args for NEXT_PUBLIC environment variables
- **#232:** correct API URL for ECS customer-web to include /api/v1
- **#231:** correct API URL in staging to include /api/v1 path
- **#227:** update staging test phone number to valid Bahrain mobile
- **#225:** add public directories for Docker build
- **#224:** add standalone output mode for Docker deployment
- **#223:** copy entire deps stage to preserve all node_modules
- **#222:** copy per-package node_modules from deps stage
- **#213:** restore proper workflow structure with comment exclusions
- **#212:** improve forbidden terminology exclusions for comments and ro…
- **#211:** exclude route paths and TypeScript keys from forbidden termi…
- **#209:** exclude Arabic punctuation from hardcoded text check
- **#206:** add word boundaries to UI Law regex patterns
- **#197:** add authMiddleware to 4 modules (addresses, bookings, cart, reviews)
- **#196:** add authMiddleware to users routes
- **#194:** use ESM import for crypto in token repository
- **#193:** return 400 for invalid OTP and use fixed OTP for test number in staging
- **#192:** add missing getBookingById function
- **#191:** use ENVIRONMENT variable for OTP mock mode safety check
- **#189:** remove waitForDelivery to prevent OTP timeout
- **#141:** merge changelog and timeline into unified auto-docs workflow
- **#43:** Resolve merge conflicts from Sprint 1 PRs

### 📚 Documentation (docs)
- **#268:** add S5-02 E2E smoke test audit for PR6
- **#240:** relax to shadcn-first approach (v2.0)
- **#214:** update documentation for Sprint 4 completion
- **#198:** complete API inventory with all 78 endpoints tested
- **#195:** document Sprint 3.9 infrastructure fixes and lessons learned
- **#188:** add API route inventory and update API reference
- **#182:** comprehensive documentation audit and gap fixes
- **#180:** add Component Specifications for 12 core components
- **#179:** Brand Voice Document - S3.8-05
- **#178:** UI Law Document - S3.8-04
- **#174:** Sprint 3 completion report and AWS permissions
- **#173:** complete Sprint 3 verification and documentation
- **#166:** add Master Roadmap links across all documentation
- **#165:** add master roadmap with complete sprint specifications
- **#164:** comprehensive pre-sprint 3 project audit
- **#163:** add pending Dependabot updates to memory
- **#162:** phase 7 cleanup and verification
- **#69:** Sprint 2 closure - update PROJECT_STATUS.md
- **#58:** Update PROJECT_STATUS.md - booking create complete
- **#56:** Update PROJECT_STATUS.md - availability conflict checks complete
- **#53:** Update PROJECT_STATUS.md - availability schema complete
- **#51:** Update PROJECT_STATUS.md
- **#49:** Update PROJECT_STATUS.md with Sprint 2 progress
- **#47:** Sprint 2 Phase 1 status update
- **#44:** Update PROJECT_STATUS.md with Sprint 1 completion summary

### 🧪 Tests (test)
- **#143:** verify unified auto-docs workflow
- **#140:** automation test v3 after APP_ID fix
- **#68:** Add comprehensive service API tests
- **#67:** Add comprehensive booking API tests
- **#23:** Add comprehensive OTP verify endpoint tests

### ⚙️ Refactors (refactor)
- **#54:** Move MVP defaults to config file

### 🏗️ Infrastructure (infra)
- **#70:** Add IaC base structure with Terraform

---

## [0.0.1] - 2026-01-01

### Added
- Initial project setup
- Monorepo structure (apps + packages)
- Core documentation (PRD, Technical Spec, Design System)

---

**Note:** For detailed API changes, see AUDITS/AUDIT_2026-01-03_API.md
