#!/bin/sh

# Run migrations if requested
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    npx prisma migrate deploy
fi

# Execute the main command
exec "$@"
