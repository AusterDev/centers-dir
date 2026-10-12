import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
    id: int().primaryKey({
        autoIncrement: true,
    }),
    username: text().notNull(),
    email: text().notNull().unique(),
    authSource: text().default("google"),
    permissions: int().default(0),

    createdAt: int().notNull(),
    lastEditedAt: int().notNull(),
});
