# URL System Design

**Version:** 1.0  
**Date:** 2026-01-11  
**Status:** Implementation Ready

---

## Goal

Create a **data-driven URL system** where all categories, products, and services are accessible via clean, slug-based URLs that are automatically generated from database entities. No hardcoded routes per category.

---

## Canonical URL Patterns

### A. Categories (Dynamic, Data-Driven)

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/categories` | All categories listing (cards/grid) | `GET /api/v1/categories` |
| `/category/[slug]` | Single category page with products/services | `GET /api/v1/categories/[slug]` |

**Examples:**
- `/category/kitchens` - Home Kitchens category
- `/category/crafts` - Crafts category
- `/category/shoes` - Shoes category (any new category works automatically)

### B. Products (Slug-Based)

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/products/[slug]` | Single product detail page | `GET /api/v1/products/[slug]` |

**Examples:**
- `/products/chicken-biryani`
- `/products/handwoven-basket`
- `/products/fresh-dates`

### C. Services (Slug-Based)

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/services/[slug]` | Single service detail page | `GET /api/v1/services/[slug]` |
| `/services/[slug]/book` | Service booking page | `GET /api/v1/services/[slug]` + booking form |

**Examples:**
- `/services/deep-house-cleaning`
- `/services/haircut-styling`
- `/services/business-strategy`

### D. Account Pages (Structured)

| Route | Purpose |
|-------|---------|
| `/me` | Account overview |
| `/me/profile` | User profile |
| `/me/orders` | Order history |
| `/me/bookings` | Service bookings |
| `/me/reviews` | User reviews |
| `/me/addresses` | Saved addresses |
| `/me/wishlist` | Wishlist |
| `/me/support` | Support tickets |

All account pages under `/me/*` namespace.

---

## Slug Generation & Storage

### 1. Database Schema

**Current State:**
- ✅ `Category.slug` exists (unique, indexed)
- ❌ `Product.slug` missing
- ❌ `Service.slug` missing

**Required Changes:**
```prisma
model Product {
  // ... existing fields
  slug String @unique
  // ... rest
  @@index([slug])
}

model Service {
  // ... existing fields
  slug String @unique
  // ... rest
  @@index([slug])
}
```

### 2. Slug Generation Algorithm

**Function:** `generateSlug(name: string): string`

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Remove duplicate hyphens
    .substring(0, 100);        // Max 100 chars
}
```

**Uniqueness Guarantee:**
- Check if slug exists in database
- If exists, append `-{counter}` (e.g., `chicken-biryani-2`)
- Retry until unique slug found

**When Generated:**
- Automatically on entity creation (Product/Service/Category)
- Admin can manually edit slug (with validation)
- Old slug preserved via redirect (see Backward Compatibility)

### 3. Storage Location

| Entity | Field | Unique | Indexed |
|--------|-------|--------|---------|
| Category | `slug` | ✅ Yes | ✅ Yes |
| Product | `slug` | ✅ Yes | ✅ Yes |
| Service | `slug` | ✅ Yes | ✅ Yes |

---

## Header Navigation (API-Driven)

### Current Problem
Header navigation is hardcoded with routes like `/kitchens`, `/crafts`, etc.

### Solution
**Dynamic Navigation from API:**

**Endpoint:** `GET /api/v1/categories?featured=true`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Home Kitchens",
      "slug": "kitchens",
      "imageUrl": "...",
      "sortOrder": 1
    },
    {
      "id": "uuid",
      "name": "Crafts",
      "slug": "crafts",
      "imageUrl": "...",
      "sortOrder": 2
    }
  ]
}
```

**Frontend Implementation:**
```typescript
// apps/customer-web/src/components/layout/header.tsx
const { data: categories } = useSWR('/api/v1/categories?featured=true');

// Generate nav links dynamically
{categories?.map(cat => (
  <Link href={`/category/${cat.slug}`} key={cat.id}>
    {cat.name}
  </Link>
))}
```

**Benefits:**
- New categories appear automatically in nav
- No code changes needed for new categories
- Admin controls which categories are "featured" in nav

---

## API Endpoints

### Categories

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | `/api/v1/categories` | List all categories | Array of categories |
| GET | `/api/v1/categories/:slug` | Get category by slug | Single category + products/services |

### Products

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | `/api/v1/products` | List products (with filters) | Array of products |
| GET | `/api/v1/products/:slug` | Get product by slug | Single product |

### Services

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| GET | `/api/v1/services` | List services (with filters) | Array of services |
| GET | `/api/v1/services/:slug` | Get service by slug | Single service |

**Query Parameters:**
- `?categorySlug=kitchens` - Filter by category
- `?search=biryani` - Search by name
- `?page=1&limit=20` - Pagination

---

## Category Page Data Flow

**Route:** `/category/[slug]`

**Data Fetching:**
```typescript
// 1. Fetch category by slug
const category = await fetch(`/api/v1/categories/${slug}`);

// 2. Fetch products in this category
const products = await fetch(`/api/v1/products?categorySlug=${slug}`);

// 3. Fetch services in this category
const services = await fetch(`/api/v1/services?categorySlug=${slug}`);

// 4. Render category page with products + services
```

**Page Structure:**
```
Category Header (name, description, image)
├── Products Section (if any)
│   └── Product cards (link to /products/[slug])
└── Services Section (if any)
    └── Service cards (link to /services/[slug])
```

---

## Backward Compatibility

### Problem
Old routes may exist:
- `/kitchens` (hardcoded category page)
- `/products/[id]` (UUID-based)
- `/services/[id]` (UUID-based)

### Solution: Redirects via Middleware

**Approach:** Temporary 307 redirects for backward compatibility

**Implementation:**
```typescript
// apps/customer-web/src/middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect old category routes
  if (pathname === '/kitchens') {
    return NextResponse.redirect(new URL('/category/kitchens', request.url), 307);
  }
  
  if (pathname === '/crafts') {
    return NextResponse.redirect(new URL('/category/crafts', request.url), 307);
  }
  
  // Redirect /categories to canonical /category listing
  if (pathname === '/categories') {
    return NextResponse.redirect(new URL('/category', request.url), 307);
  }
  
  // UUID-based product/service redirects (if needed)
  // Check if pathname matches UUID pattern, lookup slug, redirect
  
  return NextResponse.next();
}
```

**Status Code:** 307 (Temporary Redirect)
- Indicates canonical URL is `/category/[slug]`
- Search engines will update indexes
- Old links continue to work

**Long-term:**
- After 3-6 months, remove redirects
- Old routes return 404 (or 410 Gone)

---

## Implementation Plan

### Phase 1: Database Migration (P0)

**Files:**
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/`

**Changes:**
1. Add `slug` field to Product model
2. Add `slug` field to Service model
3. Create migration: `pnpm prisma migrate dev --name add_product_service_slugs`
4. Update seed script to generate slugs for existing data

**Estimated Time:** 30 minutes

---

### Phase 2: API Endpoints (P0)

**Files:**
- `apps/api/src/routes/categories.ts`
- `apps/api/src/routes/products.ts`
- `apps/api/src/routes/services.ts`

**Changes:**
1. Add `GET /categories/:slug` endpoint
2. Add `GET /products/:slug` endpoint
3. Add `GET /services/:slug` endpoint
4. Update list endpoints to support `?categorySlug=` filter

**Estimated Time:** 1 hour

---

### Phase 3: Frontend Dynamic Routes (P0)

**Files:**
- `apps/customer-web/src/app/(app)/category/page.tsx` (existing)
- `apps/customer-web/src/app/(app)/category/[slug]/page.tsx` (new)
- `apps/customer-web/src/app/(app)/products/[slug]/page.tsx` (new)
- `apps/customer-web/src/app/(app)/services/[slug]/page.tsx` (new)
- `apps/customer-web/src/app/(app)/services/[slug]/book/page.tsx` (update)

**Changes:**
1. Create `/category/[slug]/page.tsx` - dynamic category page
2. Create `/products/[slug]/page.tsx` - product detail by slug
3. Create `/services/[slug]/page.tsx` - service detail by slug
4. Update `/services/[slug]/book/page.tsx` to use slug instead of ID

**Estimated Time:** 2 hours

---

### Phase 4: Header Navigation (P0)

**Files:**
- `apps/customer-web/src/components/layout/header.tsx`

**Changes:**
1. Fetch categories from API (`/api/v1/categories?featured=true`)
2. Generate nav links dynamically from category data
3. Remove hardcoded routes like `/kitchens`, `/crafts`

**Estimated Time:** 30 minutes

---

### Phase 5: Middleware Redirects (P1)

**Files:**
- `apps/customer-web/src/middleware.ts` (existing)

**Changes:**
1. Add redirects for old category routes (`/kitchens` → `/category/kitchens`)
2. Keep existing redirects (`/categories` → `/category`)
3. Document redirect strategy

**Estimated Time:** 15 minutes

---

### Phase 6: Testing & Evidence (P0)

**Actions:**
1. Deploy to staging
2. Test all routes:
   - `/categories` - shows all categories
   - `/category/kitchens` - shows kitchens category
   - `/category/shoes` - create new category, verify it works
   - `/products/[slug]` - product detail
   - `/services/[slug]` - service detail
3. Collect evidence:
   - Screenshots of each page
   - curl proofs for API endpoints
   - CI green

**Estimated Time:** 1 hour

---

## Testing Checklist

### Functional Tests

- [ ] `/categories` shows all categories from API
- [ ] `/category/kitchens` shows kitchens category with products/services
- [ ] Create new category "Shoes" via admin/seed
- [ ] `/category/shoes` works automatically
- [ ] "Shoes" appears on `/categories` page
- [ ] "Shoes" appears in header nav (if featured)
- [ ] `/products/chicken-biryani` shows product detail
- [ ] `/services/deep-house-cleaning` shows service detail
- [ ] `/services/deep-house-cleaning/book` shows booking page
- [ ] Old routes redirect correctly (`/kitchens` → `/category/kitchens`)

### API Tests

```bash
# Categories
curl https://api-staging.nasneh.com/api/v1/categories
curl https://api-staging.nasneh.com/api/v1/categories/kitchens

# Products
curl https://api-staging.nasneh.com/api/v1/products
curl https://api-staging.nasneh.com/api/v1/products/chicken-biryani

# Services
curl https://api-staging.nasneh.com/api/v1/services
curl https://api-staging.nasneh.com/api/v1/services/deep-house-cleaning
```

### CI Tests

- [ ] All lint checks pass
- [ ] All type checks pass
- [ ] All unit tests pass
- [ ] UI Law Compliance passes

---

## Slug Change Strategy

### When Slug Changes

**Scenario:** Admin changes product name from "Chicken Biryani" to "Spicy Chicken Biryani"

**Options:**

**Option 1: Preserve Old Slug (Recommended)**
- Keep slug as `chicken-biryani`
- Only change slug if admin explicitly edits it
- Prevents broken links

**Option 2: Auto-Update with Redirect**
- Generate new slug: `spicy-chicken-biryani`
- Store old slug in `slug_redirects` table
- Redirect old slug → new slug (301 Permanent)

**Implementation (Option 1):**
```typescript
// On product update
if (!input.slug) {
  // Keep existing slug, don't regenerate
  input.slug = existingProduct.slug;
}
```

**Implementation (Option 2):**
```prisma
model SlugRedirect {
  id        String   @id @default(uuid())
  entityType String  // "product", "service", "category"
  oldSlug   String   @unique
  newSlug   String
  createdAt DateTime @default(now())
  
  @@index([oldSlug])
}
```

**Recommendation:** Start with Option 1 (simpler, no migrations needed). Implement Option 2 if slug changes become frequent.

---

## Security Considerations

### Slug Validation

- Max length: 100 characters
- Allowed characters: `a-z`, `0-9`, `-`
- No SQL injection risk (parameterized queries)
- No XSS risk (slugs are URL-encoded)

### Rate Limiting

- Slug lookup endpoints should be cached (CDN)
- No rate limiting needed for public read endpoints

---

## Performance Considerations

### Database Indexes

```sql
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_categories_slug ON categories(slug); -- Already exists
```

### Caching Strategy

- Cache category list: 5 minutes
- Cache category detail: 1 minute
- Cache product/service detail: 30 seconds
- Use SWR on frontend for client-side caching

---

## Migration Rollout

### Step 1: Backend (API)
1. Add slug fields to Product/Service models
2. Run migration on staging DB
3. Update seed script to generate slugs
4. Deploy API with new endpoints

### Step 2: Frontend (customer-web)
1. Create dynamic routes
2. Update header navigation
3. Add middleware redirects
4. Deploy frontend

### Step 3: Verification
1. Test all routes on staging
2. Collect evidence (screenshots + curl)
3. Fix any issues
4. Deploy to production

---

## Success Criteria

✅ **Complete when:**
1. Any new category added via admin works automatically on customer-web
2. Header navigation is 100% API-driven (no hardcoded routes)
3. All products/services accessible via clean slug URLs
4. Old routes redirect correctly
5. Evidence pack delivered (screenshots + curl proofs + CI green)

---

## Open Questions

**Q: Should we support Arabic slugs?**  
**A:** No. Use English slugs only for URLs (SEO best practice). Arabic names stored in `nameAr` field.

**Q: What if two products have the same name?**  
**A:** Append counter: `chicken-biryani`, `chicken-biryani-2`, etc.

**Q: Should slugs be editable by admin?**  
**A:** Yes, but with warning about breaking links. Implement redirect table later if needed.

---

## References

- Prisma Schema: `apps/api/prisma/schema.prisma`
- API Routes: `apps/api/src/routes/`
- Frontend Routes: `apps/customer-web/src/app/(app)/`
- Middleware: `apps/customer-web/src/middleware.ts`

---

**End of Design Document**
