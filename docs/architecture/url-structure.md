# Nasneh URL Architecture v2.0

**Date:** January 12, 2026  
**Status:** Implementation Ready  
**Architecture:** Hierarchical + Multi-Category Support

---

## 🎯 Goals

1. **Clear hierarchy** - Users can navigate up/down easily
2. **Multi-category vendors** - Vendors can be in multiple categories
3. **SEO optimized** - Clear URL structure for search engines
4. **Scalable** - Easy to add subcategories later

---

## 📐 URL Structure

### **Homepage & Browse**
```
/                               → Homepage
/browse                         → Browse all categories (optional)
```

### **Market Category**
```
/market                         → Market landing page
/market/vendors                 → List all market vendors
/market/vendors/[slug]          → Single vendor profile (market products only)
/market/products                → All market products
/market/products/[slug]         → Single product page
```

### **Kitchens Category**
```
/kitchens                       → Kitchens landing page
/kitchens/vendors               → List all kitchen vendors
/kitchens/vendors/[slug]        → Single vendor profile (kitchen products only)
/kitchens/products              → All kitchen products
/kitchens/products/[slug]       → Single product page
```

### **Craft Category**
```
/craft                          → Craft landing page
/craft/vendors                  → List all craft vendors
/craft/vendors/[slug]           → Single vendor profile (craft products only)
/craft/products                 → All craft products
/craft/products/[slug]          → Single product page
```

### **Food Trucks Category**
```
/food-trucks                    → Food trucks landing page
/food-trucks/vendors            → List all food truck vendors
/food-trucks/vendors/[slug]     → Single vendor profile (food truck products only)
/food-trucks/products           → All food truck products
/food-trucks/products/[slug]    → Single product page
```

### **Services Category**
```
/services                       → Services landing page
/services/providers             → List all service providers
/services/providers/[slug]      → Single provider profile (services only)
/services/all                   → All services
/services/[slug]                → Single service page (bookable)
```

### **Global Vendor Profile**
```
/vendors/[slug]                 → Vendor's global profile (ALL categories)
```

### **Global Product/Service Pages**
```
/products/[slug]                → Single product page (any category)
/services/[slug]                → Single service page (bookable)
```

---

## 🔄 Multi-Category Example

**Vendor: Hassan**
- Categories: Market + Craft
- Products:
  - Market: Honey (500g), Dates (1kg)
  - Craft: Wooden honey box, Handmade spoon

**URLs:**
```
/market/vendors/hassan          → Hassan's market products only
/craft/vendors/hassan           → Hassan's craft products only
/vendors/hassan                 → Hassan's ALL products (both categories)

/market/products/honey-jar      → Honey product page
/craft/products/wooden-box      → Wooden box product page
/products/honey-jar             → Alternative (global product page)
```

---

## 🧭 Navigation Flow

### **User Journey Example:**

1. Homepage `/`
2. Click "Market" → `/market`
3. Click "Browse Vendors" → `/market/vendors`
4. Click "Hassan" → `/market/vendors/hassan`
5. Click "Honey Jar" → `/market/products/honey-jar`
6. **Breadcrumb:** Home > Market > Vendors > Hassan > Honey Jar

**Easy to go back at any level!**

---

## 📁 Next.js Directory Structure

```
apps/customer-web/src/app/(app)/
├── market/
│   ├── page.tsx                    → /market
│   ├── vendors/
│   │   ├── page.tsx                → /market/vendors
│   │   └── [slug]/
│   │       └── page.tsx            → /market/vendors/[slug]
│   └── products/
│       ├── page.tsx                → /market/products
│       └── [slug]/
│           └── page.tsx            → /market/products/[slug]
├── kitchens/
│   ├── page.tsx
│   ├── vendors/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── products/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── craft/
│   ├── page.tsx
│   ├── vendors/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── products/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── food-trucks/
│   ├── page.tsx
│   ├── vendors/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── products/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── services/
│   ├── page.tsx
│   ├── providers/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── all/
│   │   └── page.tsx
│   └── [slug]/
│       └── page.tsx
├── vendors/
│   └── [slug]/
│       └── page.tsx                → /vendors/[slug] (global)
├── products/
│   └── [slug]/
│       └── page.tsx                → /products/[slug] (global)
└── services/
    └── [slug]/
        └── page.tsx                → /services/[slug] (global)
```

---

## 🔀 Middleware Rules

```typescript
// Redirect old URLs to new structure
/categories/food-trucks → /food-trucks
/categories/craft → /craft
/categories/products → /market
/categories/kitchens → /kitchens
/categories/services → /services

// Redirect old /category/ to new structure
/category/[slug] → /[slug] (if it's a main category)
```

---

## ✅ Migration Checklist

- [ ] Create new directory structure
- [ ] Implement category landing pages
- [ ] Implement vendor listing pages
- [ ] Implement vendor profile pages (category-specific)
- [ ] Implement product listing pages
- [ ] Update global vendor profile page
- [ ] Update navigation links in header
- [ ] Update navigation links in footer
- [ ] Update middleware redirects
- [ ] Test all URLs locally
- [ ] Deploy to staging
- [ ] Verify all URLs work

---

## 📝 Notes

- **Global vs Category-Specific:**
  - `/market/vendors/hassan` → Shows only market products
  - `/vendors/hassan` → Shows ALL products (all categories)

- **Breadcrumbs:**
  - Always show full path for easy navigation
  - Example: Home > Market > Vendors > Hassan > Honey Jar

- **SEO:**
  - Category-specific URLs better for SEO
  - `/market/products/honey` clearly indicates it's a market product

---

**End of Architecture Document**
