/*
  Warnings:

  - Added the required column `type` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "repeat" BOOLEAN NOT NULL DEFAULT false,
    "guild_id" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Events_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("discord_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Events" ("created_at", "created_by", "day", "description", "guild_id", "id", "month", "repeat", "updated_at") SELECT "created_at", "created_by", "day", "description", "guild_id", "id", "month", "repeat", "updated_at" FROM "Events";
DROP TABLE "Events";
ALTER TABLE "new_Events" RENAME TO "Events";
PRAGMA foreign_key_check("Events");
PRAGMA foreign_keys=ON;
