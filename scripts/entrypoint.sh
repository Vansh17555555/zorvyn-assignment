#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec "$@"
