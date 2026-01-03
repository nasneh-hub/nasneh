#!/usr/bin/env sh
set -eu

echo "🔄 Running database migrations..."
cd /app
# After removing --prod flag, prisma CLI is now in standard location
./node_modules/.bin/prisma migrate deploy
echo "✅ Migrations completed successfully!"
