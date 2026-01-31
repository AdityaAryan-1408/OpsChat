#!/bin/sh

set -e # stops command execution if a command fails

echo "Starting OpsChat Backend..."

# Always run database migrations first to ensure the database schema is up to date
echo "Running database migrations..."
npx prisma migrate deploy

# Start the server
echo "Starting the server..."
exec npm start