# Nasneh - ناسنه

> Multi-category marketplace platform for Bahrain
> "مني الك ومنك الي" (From me to you, from you to me)

## Documentation

Start here: [docs/00_START_HERE.md](./docs/00_START_HERE.md)

| Document | Description |
|----------|-------------|
| [PRD](./docs/PRD_MASTER.md) | Product Requirements |
| [Technical Spec](./docs/TECHNICAL_SPEC.md) | Architecture & APIs |
| [Design System](./docs/DESIGN_SYSTEM.md) | UI/UX Guidelines |

## Project Structure

```
nasneh/
├── apps/
│   ├── customer-web/    # Customer-facing web app
│   ├── dashboard/       # Admin, Vendor, Provider, Driver dashboards
│   └── api/             # Backend API
├── packages/
│   ├── ui/              # Shared UI components
│   ├── types/           # Shared TypeScript types
│   ├── config/          # Shared configurations
│   └── utils/           # Shared utilities
└── docs/                # Project documentation
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Build all apps
pnpm build
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | Node.js, Express, Prisma, PostgreSQL |
| Cache | Redis |
| Infrastructure | AWS (Bahrain region - me-south-1) |
| Payments | Amazon Payment Services (APS) |

## URLs

| App | URL |
|-----|-----|
| Customer Web | nasneh.com |
| Dashboard | dashboard.nasneh.com |
| API | api.nasneh.com |

## Design Rules (Critical)

| Rule | Value |
|------|-------|
| Font | Vazirmatn ONLY |
| Colors | Mono (Black/White/Gray) + semantic for status |
| Borders | NEVER use borders |
| Radius | 12px (rounded-xl) everywhere |
| Heights | 32px / 40px / 48px / 56px |

---

**Region:** Bahrain  
**Currency:** BHD (3 decimals)
