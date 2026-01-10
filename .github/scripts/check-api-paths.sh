#!/bin/bash

# Check for duplicate /api/v1 in API paths
# This script prevents the common mistake of adding /api/v1 to fetch calls
# when NEXT_PUBLIC_API_URL already includes it.

set -e

echo "🔍 Checking for duplicate /api/v1 in API paths..."

# Find files with potential duplicate /api/v1
ERRORS=0

# Pattern 1: NEXT_PUBLIC_API_URL}/api/v1
if grep -rn "NEXT_PUBLIC_API_URL}/api/v1" apps/customer-web/src --include="*.tsx" --include="*.ts" --exclude-dir=node_modules; then
  echo "❌ ERROR: Found duplicate /api/v1 in API paths"
  echo "   NEXT_PUBLIC_API_URL already includes /api/v1"
  echo "   Use: \${process.env.NEXT_PUBLIC_API_URL}/services"
  echo "   NOT: \${process.env.NEXT_PUBLIC_API_URL}/api/v1/services"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 2: API_BASE_URL}/api/v1 (for constants)
if grep -rn "API_BASE_URL}/api/v1" apps/customer-web/src --include="*.tsx" --include="*.ts" --exclude-dir=node_modules; then
  echo "❌ ERROR: Found duplicate /api/v1 with API_BASE_URL"
  echo "   API_BASE_URL already includes /api/v1"
  echo "   Use: \${API_BASE_URL}/services"
  echo "   NOT: \${API_BASE_URL}/api/v1/services"
  ERRORS=$((ERRORS + 1))
fi

# Pattern 3: apiUrl}/api/v1 (for variables)
if grep -rn "apiUrl}/api/v1" apps/customer-web/src --include="*.tsx" --include="*.ts" --exclude-dir=node_modules; then
  echo "❌ ERROR: Found duplicate /api/v1 with apiUrl variable"
  echo "   apiUrl already includes /api/v1"
  echo "   Use: \${apiUrl}/services"
  echo "   NOT: \${apiUrl}/api/v1/services"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ No duplicate /api/v1 paths found"
  exit 0
else
  echo ""
  echo "💡 TIP: Use the API helper functions from @/lib/api:"
  echo "   import { apiUrl, apiFetch } from '@/lib/api';"
  echo "   const url = apiUrl('/services'); // Automatic URL building"
  echo "   const response = await apiFetch('/services'); // Fetch wrapper"
  exit 1
fi
