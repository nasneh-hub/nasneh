# API Utilities

## Overview

This directory contains utility functions for interacting with the Nasneh API.

## API Helper Functions

### `getApiBaseUrl()`

Returns the API base URL from environment variables.

```typescript
import { getApiBaseUrl } from '@/lib/api';

const baseUrl = getApiBaseUrl();
// → 'https://api-staging.nasneh.com/api/v1'
```

### `apiUrl(path)`

Builds a full API URL from a relative path.

```typescript
import { apiUrl } from '@/lib/api';

const url = apiUrl('/services');
// → 'https://api-staging.nasneh.com/api/v1/services'

const userUrl = apiUrl('/users/me');
// → 'https://api-staging.nasneh.com/api/v1/users/me'
```

### `apiFetch(path, options?)`

Fetch wrapper with automatic API URL building.

```typescript
import { apiFetch } from '@/lib/api';

// GET request
const response = await apiFetch('/services');
const data = await response.json();

// POST request
const response = await apiFetch('/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ serviceId: '123' }),
});
```

## Why Use These Helpers?

### Problem: Duplicate /api/v1 Paths

`NEXT_PUBLIC_API_URL` includes the full base URL with `/api/v1`:
- Production: `https://api.nasneh.com/api/v1`
- Staging: `https://api-staging.nasneh.com/api/v1`
- Development: `http://localhost:3001/api/v1`

**Common mistake:**

```typescript
// ❌ Wrong: Creates duplicate /api/v1
const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/services`;
// → https://api-staging.nasneh.com/api/v1/api/v1/services (404!)
```

**Correct approach:**

```typescript
// ✅ Correct: Use helper
import { apiUrl } from '@/lib/api';
const url = apiUrl('/services');
// → https://api-staging.nasneh.com/api/v1/services
```

### Solution: Centralized URL Building

The helper functions:
1. ✅ Prevent duplicate `/api/v1` paths
2. ✅ Handle leading slashes automatically
3. ✅ Provide consistent API URL building
4. ✅ Make code more maintainable

## CI Protection

A CI check runs on every PR to prevent duplicate `/api/v1` paths:

```bash
.github/scripts/check-api-paths.sh
```

This script scans for patterns like:
- `NEXT_PUBLIC_API_URL}/api/v1`
- `API_BASE_URL}/api/v1`
- `apiUrl}/api/v1`

If found, the PR will fail with a helpful error message.

## Migration Guide

### Before (Manual URL Building)

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nasneh.com/api/v1';
const response = await fetch(`${apiUrl}/services`);
```

### After (Using Helpers)

```typescript
import { apiFetch } from '@/lib/api';
const response = await apiFetch('/services');
```

## Best Practices

1. **Always use helpers** for API calls in new code
2. **Never hardcode** `/api/v1` in fetch URLs
3. **Use `apiFetch`** for simple requests
4. **Use `apiUrl`** when you need the URL string
5. **Check CI** - if it fails, you likely have a duplicate path

## Examples

### Fetching Services

```typescript
import { apiFetch } from '@/lib/api';

async function getServices() {
  const response = await apiFetch('/services?sortBy=newest&limit=20');
  const data = await response.json();
  return data;
}
```

### Creating a Booking

```typescript
import { apiFetch } from '@/lib/api';

async function createBooking(bookingData) {
  const response = await apiFetch('/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });
  return response.json();
}
```

### Building URLs for Links

```typescript
import { apiUrl } from '@/lib/api';

function ServiceImage({ service }) {
  const imageUrl = service.image ? apiUrl(`/media/${service.image}`) : '/placeholder.png';
  return <img src={imageUrl} alt={service.name} />;
}
```

## Environment Variables

**Required:**
- `NEXT_PUBLIC_API_URL` - Full API base URL with `/api/v1` suffix

**Example `.env.local`:**

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Staging
NEXT_PUBLIC_API_URL=https://api-staging.nasneh.com/api/v1

# Production
NEXT_PUBLIC_API_URL=https://api.nasneh.com/api/v1
```

## Troubleshooting

### 404 Errors on API Calls

**Symptom:** API calls return 404

**Likely cause:** Duplicate `/api/v1` in URL

**Check:**
1. Open browser DevTools → Network tab
2. Look for URLs like: `.../api/v1/api/v1/...`
3. If found, you're not using the helpers

**Fix:**
```typescript
// ❌ Before
const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/services`;

// ✅ After
import { apiUrl } from '@/lib/api';
const url = apiUrl('/services');
```

### CI Check Failing

**Symptom:** PR blocked by "API Path Check" failure

**Cause:** Code contains duplicate `/api/v1` pattern

**Fix:**
1. Check the CI logs for the exact file and line
2. Replace manual URL building with helpers
3. Run `.github/scripts/check-api-paths.sh` locally to verify

## Support

For questions or issues, refer to:
- [Technical Spec](../../../docs/SPECS/TECHNICAL_SPEC.md)
- [Manus Memory](../../../docs/MEMORY/MANUS_MEMORY.md)
