import type { D1Database } from "@cloudflare/workers-types";
import type { Experience } from "../models/common";
import { RecordNotFoundError } from "./errors";

type ExperienceBasic = {
    msg: string;
    overallRating: number;
    supportiveStaffRating?: number;
    infraRating?: number;
    corruptionRating?: number;
    pcpRating?: number;
    accessibilityRating?: number;
    originalPosterID?: number | null;
    centerID: number;
}

type ExperienceEdit = {
    msg?: string;
    originalPosterID: number;
}

type ExperienceGet = {
    centerID: number,
    id?: number,
    overallRating?: number;
    supportiveStaffRating?: number;
    infraRating?: number;
    corruptionRating?: number;
    pcpRating?: number;
    accessibilityRating?: number;
    select?: number;
    order?: "ascending" | "descending";
    offset?: number;
}

export async function createExperience(db: D1Database, basics: ExperienceBasic): Promise<Experience> {
    const query = `
        INSERT INTO experiences (
            msg, overallRating, supportiveStaffRating, infraRating, 
            corruptionRating, pcpRating, accessibilityRating, originalPosterID, centerID
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
        RETURNING *;
    `;

    try {
        const newExperience = await db.prepare(query)
            .bind(
                basics.msg,
                basics.overallRating,
                basics.supportiveStaffRating ?? 0,
                basics.infraRating ?? 0,
                basics.corruptionRating ?? 0,
                basics.pcpRating ?? 0,
                basics.accessibilityRating ?? 0,
                basics.originalPosterID ?? null,
                basics.centerID
            )
            .first<Experience>();

        if (!newExperience) {
            throw new Error("failed to create experience");
        }
        return newExperience;
    } catch (error: any) {
        throw error;
    }
}

export async function getExperience(db: D1Database, basics: ExperienceGet): Promise<Experience[]> {
    try {
        const conditions: string[] = [];
        const bindings: any[] = [];

        if (basics.id) {
            conditions.push("id = ?");
            bindings.push(basics.id);
        }
        if (basics.overallRating) {
            conditions.push("overallRating = ?");
            bindings.push(basics.overallRating);
        }
        if (basics.accessibilityRating) {
            conditions.push("accessibilityRating = ?");
            bindings.push(basics.accessibilityRating);
        }
        if (basics.pcpRating) {
            conditions.push("pcpRating = ?");
            bindings.push(basics.pcpRating);
        }
        if (basics.supportiveStaffRating) {
            conditions.push("supportiveStaffRating = ?");
            bindings.push(basics.supportiveStaffRating);
        }
        if (basics.corruptionRating) {
            conditions.push("corruptionRating = ?");
            bindings.push(basics.supportiveStaffRating);
        }
        if (basics.infraRating) {
            conditions.push("infraRating = ?");
            bindings.push(basics.infraRating);
        }

        let query = `SELECT * FROM experiences`;
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        query += ` LIMIT ? OFFSET ?`;
        bindings.push(basics.select, basics.offset);

        const stmt = db.prepare(query);
        const { results } = await stmt.bind(...bindings).all();

        return results as Experience[];
    } catch (error: any) {
        throw error;
    }
}

export async function editExperience(db: D1Database, id: number, edit: ExperienceEdit): Promise<Experience> {
    const fields: string[] = [];
    const values: any[] = [];

    if (edit.msg !== undefined) {
        fields.push("msg = ?");
        values.push(edit.msg);
    }

    if (fields.length === 0) {
        throw new Error("no fields were provided to edit");
    }

    values.push(id, edit.originalPosterID);

    const query = `
        UPDATE experiences
        SET ${fields.join(", ")}
        WHERE id = ? AND originalPosterID = ?
        RETURNING *;
    `;

    try {
        const updatedExperience = await db.prepare(query)
            .bind(...values)
            .first<Experience>();

        if (!updatedExperience) {
            throw new Error("failed to update experience");
        }
        return updatedExperience;
    } catch (error: any) {
        throw error;
    }
}