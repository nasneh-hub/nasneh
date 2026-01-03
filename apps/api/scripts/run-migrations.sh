#!/usr/bin/env sh
set -eu

echo "🔄 Running database migrations..."
cd /app
./node_modules/@prisma/client/node_modules/.bin/prisma migrate deploy
echo "✅ Migrations completed successfully!"
