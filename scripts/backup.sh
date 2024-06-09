#!/bin/sh

DB_PATH="/data/db.sqlite"
BACKUP_DIR="/backup"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BACKUP_FILE="$BACKUP_DIR/$TIMESTAMP.tar.gz"
DISCORD_WEBHOOK_URL=$DISCORD_BACKUP_WEBHOOK

mkdir -p $BACKUP_DIR

sqlite3 $DB_PATH ".backup $BACKUP_DIR/db.sqlite"

tar -czf $BACKUP_FILE $BACKUP_DIR/db.sqlite

rm $BACKUP_DIR/db.sqlite
cp $BACKUP_FILE $BACKUP_DIR/latest.tar.gz

# Add new providers here

## Discord Webhook
curl -X POST -H "Content-Type: multipart/form-data" -F "file=@$BACKUP_FILE" $DISCORD_WEBHOOK_URL

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -exec rm {} \;