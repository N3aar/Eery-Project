-- CreateTable
CREATE TABLE "Daily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER NOT NULL DEFAULT 0,
    "afternoon" INTEGER NOT NULL DEFAULT 0,
    "night" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discord_id" TEXT NOT NULL,
    "main_channel" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daily_id" TEXT,
    CONSTRAINT "Guild_daily_id_fkey" FOREIGN KEY ("daily_id") REFERENCES "Daily" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("created_at", "discord_id", "id", "main_channel", "updated_at") SELECT "created_at", "discord_id", "id", "main_channel", "updated_at" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_discord_id_key" ON "Guild"("discord_id");
PRAGMA foreign_key_check("Guild");
PRAGMA foreign_keys=ON;
