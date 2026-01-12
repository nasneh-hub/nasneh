# Add to Cart Debugging Guide

## Problem Statement

**Feature:** Add to Cart button on product pages  
**Status:** Not working on staging  
**Last Updated:** January 12, 2026

---

## Symptoms

1. **Button Click Behavior:**
   - Clicking "Add to Cart" redirects to home page (`/`)
   - No API call is made (confirmed via fetch interceptor)
   - Cart count remains at `0`
   - No console errors

2. **Expected Behavior:**
   - API POST request to `/api/v1/cart/items`
   - Success response
   - Cart count updates to `1`
   - Toast notification (TODO)
   - User stays on product page

---

## Code Analysis

### Current Implementation

**Location:** `apps/customer-web/src/app/(app)/products/[slug]/page.tsx`

**Function:** `handleAddToCart()` (Lines 135-182)

```typescript
async function handleAddToCart() {
  if (!product) return;
  
  try {
    setIsAddingToCart(true);
    
    // Get access token from localStorage
    const accessToken = typeof window !== 'undefined' 
      ? localStorage.getItem('nasneh_access_token')
      : null;
    
    if (!accessToken) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    
    const response = await fetch(
      getApiUrl('/cart/items'),  // ✅ FIXED in PR #311
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      }
    );
    
    if (response.ok) {
      // TODO: Show success toast
      // TODO: Update cart count
      console.log('Product added to cart successfully');
    } else if (response.status === 401) {
      // Redirect to login
      router.push('/login');
    } else {
      console.error('Failed to add to cart:', response.status);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  } finally {
    setIsAddingToCart(false);
  }
}
```

**Button Component:** `apps/customer-web/src/components/product/product-info.tsx`

```typescript
<Button
  onClick={onAddToCart}
  disabled={isOutOfStock || isAddingToCart}
  className="w-full"
>
  {isAddingToCart ? en.common.loading : en.product.addToCart}
</Button>
```

---

## Investigation Results

### ✅ Confirmed Working

1. **User Authentication:**
   - Token exists in localStorage: `nasneh_access_token`
   - User data exists: `nasneh_user`
   - Refresh token exists: `nasneh_refresh_token`
   - User is ADMIN role

2. **API Endpoint:**
   - Correct URL: `https://api-staging.nasneh.com/api/v1/cart/items`
   - No double prefix (fixed in PR #311)

3. **Code Quality:**
   - ✅ Lint passed
   - ✅ Type check passed
   - ✅ UI Law passed

4. **Deployment:**
   - PR #311 merged at 12:43 PM
   - CD workflow completed successfully at 12:49 PM
   - Duration: ~6 minutes

5. **Products:**
   - 75 products in database
   - Test product exists: "Tahini" (BHD 4.500)
   - Product page loads correctly

### ❌ Not Working

1. **Fetch Call:**
   - Fetch interceptor shows NO API call
   - Means the fetch() line is never reached

2. **Redirect:**
   - Page redirects to `/` (home)
   - Happens immediately after button click

3. **Cart Count:**
   - Stays at `0`
   - No update

---

## Possible Causes

### 1. Early Return Before Fetch

**Theory:** Code is returning before reaching the fetch call

**Evidence:**
- Fetch interceptor shows no API call
- Redirect happens immediately

**Possible Reasons:**
- `if (!product) return;` - But product exists
- `if (!accessToken)` - But token exists in localStorage
- Some other condition causing early return

**Debug Steps:**
```typescript
async function handleAddToCart() {
  console.log('[DEBUG] 1. handleAddToCart called');
  if (!product) {
    console.log('[DEBUG] 2. No product, returning');
    return;
  }
  console.log('[DEBUG] 3. Product exists:', product.id);
  
  try {
    console.log('[DEBUG] 4. Setting isAddingToCart');
    setIsAddingToCart(true);
    
    const accessToken = typeof window !== 'undefined' 
      ? localStorage.getItem('nasneh_access_token')
      : null;
    
    console.log('[DEBUG] 5. Access token:', accessToken ? 'EXISTS' : 'NULL');
    
    if (!accessToken) {
      console.log('[DEBUG] 6. No token, redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('[DEBUG] 7. About to fetch');
    const response = await fetch(
      getApiUrl('/cart/items'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      }
    );
    console.log('[DEBUG] 8. Fetch completed:', response.status);
    
    // ... rest of code
  } catch (error) {
    console.error('[DEBUG] 9. Error:', error);
  } finally {
    console.log('[DEBUG] 10. Finally block');
    setIsAddingToCart(false);
  }
}
```

### 2. Router Push Side Effect

**Theory:** `router.push('/login')` is being called, then `/login` redirects to `/` for authenticated users

**Evidence:**
- User is authenticated
- Redirect goes to `/` not `/login`

**Debug Steps:**
1. Check `/login` page implementation
2. See if it redirects authenticated users to home
3. Add console.log before router.push

### 3. Component Unmounting

**Theory:** Component unmounts before fetch completes

**Evidence:**
- Redirect happens immediately
- No fetch call logged

**Debug Steps:**
1. Add useEffect cleanup
2. Check if component is unmounting
3. Add console.log in component lifecycle

### 4. Event Handler Issue

**Theory:** onClick handler not properly bound or being overridden

**Evidence:**
- Button click does trigger something (redirect happens)
- But not the expected behavior

**Debug Steps:**
1. Check if Button component has internal onClick
2. Verify onAddToCart prop is passed correctly
3. Test with inline onClick

### 5. Build Cache Issue

**Theory:** Deployment didn't pick up latest changes

**Evidence:**
- CD workflow shows success
- But behavior unchanged

**Debug Steps:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check deployed file contents
4. Verify deployment timestamp

### 6. Next.js Routing Issue

**Theory:** Next.js router is intercepting the click

**Evidence:**
- Redirect happens without fetch
- No console logs

**Debug Steps:**
1. Check if there's a Link component wrapping the button
2. Verify no form submission happening
3. Check Next.js routing configuration

---

## Debugging Checklist

### Phase 1: Verify Deployment

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Clear browser cache completely
- [ ] Check deployment timestamp matches PR merge time
- [ ] Verify getApiUrl import exists in deployed code
- [ ] Check if source maps show latest code

### Phase 2: Add Logging

- [ ] Add console.log at start of handleAddToCart
- [ ] Log product existence
- [ ] Log accessToken existence
- [ ] Log before fetch call
- [ ] Log after fetch call
- [ ] Log any errors

### Phase 3: Test Locally

- [ ] Clone repo
- [ ] Checkout main branch
- [ ] Run locally: `pnpm dev`
- [ ] Test Add to Cart on localhost
- [ ] Compare behavior with staging

### Phase 4: Isolate Issue

- [ ] Test with different product
- [ ] Test with different user
- [ ] Test in incognito mode
- [ ] Test in different browser
- [ ] Test on different device

### Phase 5: Check Dependencies

- [ ] Verify Button component implementation
- [ ] Check if @nasneh/ui has updates
- [ ] Verify Next.js router version
- [ ] Check for conflicting middleware

---

## Quick Tests

### Test 1: Console Direct Call

```javascript
// In browser console on product page
const accessToken = localStorage.getItem('nasneh_access_token');
const productId = 'YOUR_PRODUCT_ID';

fetch('https://api-staging.nasneh.com/api/v1/cart/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    productId: productId,
    quantity: 1,
  }),
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

**Expected:** Success response  
**If fails:** API issue  
**If succeeds:** Frontend issue

### Test 2: Button Click Logging

```javascript
// In browser console on product page
document.querySelector('button').addEventListener('click', (e) => {
  console.log('[TEST] Button clicked!', e);
}, true);
```

**Expected:** Log appears when button clicked  
**If no log:** Button not found or event not firing  
**If log appears:** Event is firing

### Test 3: Check Deployed Code

```bash
# View deployed page source
curl https://staging.nasneh.com/products/tahini | grep -A 10 "handleAddToCart"
```

**Expected:** See latest code with getApiUrl  
**If not found:** Deployment issue  
**If found:** Code is deployed

---

## Workarounds

### Workaround 1: Direct API Call

If frontend issue persists, implement temporary direct API call:

```typescript
async function handleAddToCart() {
  if (!product) return;
  
  const accessToken = localStorage.getItem('nasneh_access_token');
  if (!accessToken) {
    router.push('/login');
    return;
  }
  
  try {
    const response = await fetch(
      'https://api-staging.nasneh.com/api/v1/cart/items',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      }
    );
    
    if (response.ok) {
      alert('Added to cart!'); // Temporary feedback
    }
  } catch (error) {
    console.error(error);
  }
}
```

### Workaround 2: Use API Client

```typescript
import { apiClient } from '@/lib/api';

async function handleAddToCart() {
  if (!product) return;
  
  try {
    await apiClient.post('/cart/items', {
      productId: product.id,
      quantity: 1,
    });
    alert('Added to cart!');
  } catch (error) {
    console.error(error);
  }
}
```

---

## Next Steps

### Immediate (Next Session)

1. **Hard refresh staging** and test again
2. **Add extensive logging** to handleAddToCart
3. **Test locally** to isolate issue
4. **Check browser network tab** manually

### Short Term

1. **Implement cart page** to verify backend works
2. **Add toast notifications** for user feedback
3. **Update cart count** in header
4. **Add error handling** with user-friendly messages

### Long Term

1. **Improve CI tests** to catch these issues
2. **Add E2E tests** for critical flows
3. **Implement monitoring** on staging
4. **Add feature flags** for safer deployments

---

## Related Issues

- **Book Now:** Similar pattern, needs testing
- **User Menu Links:** Different issue (showing "Loading...")
- **CI Tests:** Failing due to DATABASE_URL

---

## Resources

- **PR #311:** https://github.com/nasneh-hub/nasneh/pull/311
- **Product Page:** `apps/customer-web/src/app/(app)/products/[slug]/page.tsx`
- **ProductInfo Component:** `apps/customer-web/src/components/product/product-info.tsx`
- **API Client:** `apps/customer-web/src/lib/api.ts`
- **Staging URL:** https://staging.nasneh.com/products/tahini

---

## Success Criteria

- [ ] Button click makes API call
- [ ] API call succeeds (200 OK)
- [ ] Cart count updates in header
- [ ] User stays on product page
- [ ] Toast notification appears
- [ ] No console errors
- [ ] Works on all products
- [ ] Works for all authenticated users

---

**Last Updated:** January 12, 2026  
**Status:** UNRESOLVED  
**Priority:** CRITICAL (P0)  
**Assigned To:** Next session
