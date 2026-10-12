import { sqliteTable, int, text, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";
import { centersTable } from "./centers";

export const ratingsTable = sqliteTable("ratings", {
    id: int().primaryKey({ autoIncrement: true }),
    label: text().notNull(),
    value: int().notNull(),
    comment: text(),
    
    userID: int().references(() => usersTable.id),
    centerID: int().references(() => centersTable.id),

    createdAt: int().notNull(),
    lastEditedAt: int().notNull(),
});

export const centerRatingsTable = sqliteTable("center_ratings", {
    id: int().primaryKey({ autoIncrement: true }),
    label: text().notNull(),

    avgRating: real("average_rating").notNull(),
    totalRatings: int("total_ratings").notNull(),

    centerID: int().notNull().references(() => centersTable.id),
}, (t) => ({
    centerLabelIdx: uniqueIndex("center_label_idx").on(t.centerID, t.label),
}));