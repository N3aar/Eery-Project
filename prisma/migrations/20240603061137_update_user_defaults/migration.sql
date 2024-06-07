-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "repeat" BOOLEAN NOT NULL DEFAULT false,
    "guild_id" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Events_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User" ("discord_id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Events" ("created_at", "created_by", "date", "description", "guild_id", "id", "repeat", "updated_at") SELECT "created_at", "created_by", "date", "description", "guild_id", "id", "repeat", "updated_at" FROM "Events";
DROP TABLE "Events";
ALTER TABLE "new_Events" RENAME TO "Events";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discord_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "birthday" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("birthday", "created_at", "discord_id", "id", "level", "updated_at", "xp") SELECT "birthday", "created_at", "discord_id", "id", "level", "updated_at", "xp" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discord_id" TEXT NOT NULL,
    "main_channel" TEXT,
    "daily_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Guild_daily_id_fkey" FOREIGN KEY ("daily_id") REFERENCES "Daily" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Guild" ("created_at", "daily_id", "discord_id", "id", "main_channel", "updated_at") SELECT "created_at", "daily_id", "discord_id", "id", "main_channel", "updated_at" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_discord_id_key" ON "Guild"("discord_id");
PRAGMA foreign_key_check("Events");
PRAGMA foreign_key_check("User");
PRAGMA foreign_key_check("Guild");
PRAGMA foreign_keys=ON;
