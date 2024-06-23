/*
  Warnings:

  - Made the column `daily_id` on table `Guild` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Jumble" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastfm_user" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "fighting_points" INTEGER NOT NULL DEFAULT 0,
    "best_time" INTEGER NOT NULL DEFAULT 0,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Jumble_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discord_id" TEXT NOT NULL,
    "main_channel" TEXT,
    "daily_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Guild_daily_id_fkey" FOREIGN KEY ("daily_id") REFERENCES "Daily" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("created_at", "daily_id", "discord_id", "id", "main_channel", "updated_at") SELECT "created_at", "daily_id", "discord_id", "id", "main_channel", "updated_at" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_discord_id_key" ON "Guild"("discord_id");
PRAGMA foreign_key_check("Guild");
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Jumble_user_id_key" ON "Jumble"("user_id");
