# Nasneh - ناسنه

> Multi-category marketplace platform for Bahrain  
> "مني الك ومنك الي" (From me to you, from you to me)

[![Release](https://img.shields.io/github/v/release/nasneh-hub/nasneh?style=flat-square)](https://github.com/nasneh-hub/nasneh/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/nasneh-hub/nasneh/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/nasneh-hub/nasneh/actions)

---

## 📊 Current Status

| Metric | Value |
|--------|-------|
| **Release** | v0.3.0 |
| **MVP Progress** | 85% |
| **Current Sprint** | Sprint 4 (Frontend Foundation) |
| **API Endpoints** | 101 |
| **Target Launch** | Feb 2, 2026 |

---

## 🚀 Quick Links

| Document | Purpose |
|----------|---------|
| [**Start Here**](./docs/00_START_HERE.md) | New to the project? Start here |
| [Master Roadmap](./docs/SPECS/MASTER_ROADMAP.md) | Sprint plan & timeline to MVP |
| [PRD](./docs/SPECS/PRD_MASTER.md) | Product requirements |
| [Technical Spec](./docs/SPECS/TECHNICAL_SPEC.md) | Architecture & APIs |
| [Design System](./docs/SPECS/DESIGN_SYSTEM.md) | UI/UX guidelines |
| [UI Law](./docs/SPECS/UI_LAW.md) | 5 non-negotiable UI rules (CI enforced) |
| [Component Specs](./docs/SPECS/COMPONENT_SPECS.md) | 12 core components |
| [Changelog](./docs/CHANGELOG.md) | Release history |

---

## 📁 Project Structure

```
nasneh/
├── apps/
│   ├── api/             # Backend API (Node.js, Express, Prisma)
│   ├── customer-web/    # Customer-facing web app (Next.js)
│   └── dashboard/       # Admin, Vendor, Provider, Driver dashboards
├── packages/
│   ├── ui/              # Shared UI components (@nasneh/ui)
│   │   ├── src/copy/    # UI text tokens (ar.ts, en.ts)
│   │   ├── src/styles/  # Design tokens (tokens.css)
│   │   └── src/fonts/   # Vazirmatn font files
│   ├── types/           # Shared TypeScript types
│   ├── config/          # Shared configurations
│   └── utils/           # Shared utilities
├── docs/
│   ├── SPECS/           # Specifications (PRD, Tech, Design)
│   ├── MEMORY/          # Project history & lessons
│   ├── AUDITS/          # Audit reports
│   ├── OPS/             # Operations & deployment
│   └── GOVERNANCE/      # AI agent rules
└── infra/               # Terraform infrastructure
```

---

## 🛠️ Getting Started

```bash
# Install dependencies
pnpm install

# Run API in development
pnpm --filter api dev

# Run all apps
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, Prisma |
| **Database** | PostgreSQL (AWS RDS) |
| **Cache** | Redis (AWS ElastiCache) |
| **Infrastructure** | AWS (Bahrain - me-south-1) |
| **Payments** | Amazon Payment Services (APS) |
| **CI/CD** | GitHub Actions |

---

## 🌐 URLs

| Environment | Customer | Dashboard | API |
|-------------|----------|-----------|-----|
| **Production** | nasneh.com | dashboard.nasneh.com | api.nasneh.com |
| **Staging** | - | - | [Health Check](http://nasneh-staging-api-alb-1514033867.me-south-1.elb.amazonaws.com/health) |

---

## 🎨 Design Rules (CI Enforced)

| Rule | Requirement |
|------|-------------|
| **Font** | Vazirmatn ONLY |
| **Colors** | Mono (Black/White/Gray) |
| **Borders** | ❌ NEVER |
| **Radius** | 12px (rounded-xl) |
| **Heights** | 32 / 40 / 48 / 56 px |
| **Components** | @nasneh/ui ONLY |

See [UI Law](./docs/SPECS/UI_LAW.md) for complete rules.

---

## 📋 Completed Sprints

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | Auth, Products, Orders, Payments | ✅ Complete |
| Sprint 2 | Services, Bookings, Cart, Reviews | ✅ Complete |
| Sprint 2.5 | DevOps Gate (AWS Infrastructure) | ✅ Complete |
| Sprint 3 | Categories, Onboarding, Drivers, Admin | ✅ Complete |
| Sprint 3.8 | Pre-Frontend (Tokens, UI Law, CI) | ✅ Complete |
| Sprint 4 | Frontend Foundation | 🏃 In Progress |

---

## 🤝 Contributing

This project uses AI-assisted development with strict governance.

Before contributing, read:
- [Contributing Guide](./docs/GOVERNANCE/CONTRIBUTING.md)
- [AI Operating Rules](./docs/GOVERNANCE/AI_OPERATING_RULES.md)

---

## 📍 Project Info

| | |
|---|---|
| **Region** | Bahrain 🇧🇭 |
| **Currency** | BHD (3 decimals) |
| **Languages** | Arabic, English |
| **License** | Private |

---

Built with ❤️ in Bahrain
