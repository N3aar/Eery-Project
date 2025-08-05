-- RedefineTables
PRAGMA defer_foreign_keys=ON;
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
    CONSTRAINT "Events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("discord_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Events" ("created_at", "created_by", "day", "description", "guild_id", "id", "month", "repeat", "type", "updated_at") SELECT "created_at", "created_by", "day", "description", "guild_id", "id", "month", "repeat", "type", "updated_at" FROM "Events";
DROP TABLE "Events";
ALTER TABLE "new_Events" RENAME TO "Events";
CREATE TABLE "new_Jumble" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastfm_user" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "fighting_points" INTEGER NOT NULL DEFAULT 0,
    "best_time" INTEGER NOT NULL DEFAULT 0,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Jumble_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Jumble" ("best_time", "created_at", "fighting_points", "id", "lastfm_user", "plays", "points", "updated_at", "user_id") SELECT "best_time", "created_at", "fighting_points", "id", "lastfm_user", "plays", "points", "updated_at", "user_id" FROM "Jumble";
DROP TABLE "Jumble";
ALTER TABLE "new_Jumble" RENAME TO "Jumble";
CREATE UNIQUE INDEX "Jumble_user_id_key" ON "Jumble"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
