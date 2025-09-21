-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discord_id" TEXT NOT NULL,
    "main_channel" TEXT,
    "daily_id" TEXT NOT NULL,
    "daily_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Guild_daily_id_fkey" FOREIGN KEY ("daily_id") REFERENCES "Daily" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("created_at", "daily_id", "discord_id", "id", "main_channel", "updated_at") SELECT "created_at", "daily_id", "discord_id", "id", "main_channel", "updated_at" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_discord_id_key" ON "Guild"("discord_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
