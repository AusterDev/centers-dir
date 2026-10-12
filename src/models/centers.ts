import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";

export const centersTable = sqliteTable("centers", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    address: text().notNull(),
    areaPIN: int().notNull(),
    state: text().notNull(),
    district: text().notNull(),
    country: text().notNull(),
    
    aiCode: int().notNull(),
    udiseCODE: int().notNull(),
    studyMediums: text().notNull(),
    gender: int().notNull(),
    mobNumber: text().notNull(),
    emailID: text().notNull(),

    gMapsLink: text().notNull(),

    originalPosterID: int().references(() => usersTable.id),

    createdAt: int().notNull(),
    lastEditedAt: int().notNull(),
});
