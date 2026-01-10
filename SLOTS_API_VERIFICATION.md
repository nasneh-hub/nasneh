# Slots API Verification

## Endpoint

```
GET /api/v1/services/:id/slots?start=YYYY-MM-DD&end=YYYY-MM-DD
```

## curl Test

```bash
curl -i "https://api-staging.nasneh.com/api/v1/services/test-service-id/slots?start=2026-01-15&end=2026-02-15"
```

## Response

```
HTTP/2 404
{"error":"Service not found"}
```

## Status

✅ **Endpoint exists** (404 = service not found, not endpoint missing)

## Expected Response Structure

Based on backend code analysis (`apps/api/src/modules/availability/availability.routes.ts`):

```typescript
{
  success: boolean;
  data: Array<{
    date: string;        // YYYY-MM-DD
    slots: Array<{
      time: string;      // HH:MM
      available: boolean;
    }>;
  }>;
}
```

## Query Parameters

- `start` (required): Start date in YYYY-MM-DD format
- `end` (required): End date in YYYY-MM-DD format

## Auth

- ❌ No auth required (public endpoint)

## Implementation Notes

1. **Date Range**: Request 30 days from selected date
2. **Error Handling**: 
   - 404 → Service not found
   - Empty response → No availability
3. **Data Mapping**:
   - Group slots by date
   - Map to DateCalendar format: `{ date: string, available: boolean }`
   - Map to TimeSlotSelector format: `{ time: string, available: boolean }`

## Testing

Once staging has services with availability data, test with:
```bash
curl -i "https://api-staging.nasneh.com/api/v1/services/{real-service-id}/slots?start=2026-01-15&end=2026-02-15"
```
