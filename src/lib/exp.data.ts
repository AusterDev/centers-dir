import type { D1Database } from "@cloudflare/workers-types";
import type { Experience } from "../models/common";

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
    overallRating?: number;
    supportiveStaffRating?: number;
    infraRating?: number;
    corruptionRating?: number;
    pcpRating?: number;
    accessibilityRating?: number;
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

export async function getExperience(db: D1Database, id: string): Promise<Experience> {
    const query = `SELECT * FROM experiences WHERE id = ?`;

    try {
        const experience = await db.prepare(query)
            .bind(id)
            .first<Experience>();

        if (!experience) {
            throw new Error("experience does not exist");
        }
        return experience;
    } catch (error: any) {
        throw error;
    }
}

export async function editExperience(db: D1Database, id: string, edit: ExperienceEdit): Promise<Experience> {
    const fields: string[] = [];
    const values: any[] = [];

    if (edit.msg !== undefined) {
        fields.push("msg = ?");
        values.push(edit.msg);
    }
    if (edit.overallRating !== undefined) {
        fields.push("overallRating = ?");
        values.push(edit.overallRating);
    }
    if (edit.supportiveStaffRating !== undefined) {
        fields.push("supportiveStaffRating = ?");
        values.push(edit.supportiveStaffRating);
    }
    if (edit.infraRating !== undefined) {
        fields.push("infraRating = ?");
        values.push(edit.infraRating);
    }
    if (edit.corruptionRating !== undefined) {
        fields.push("corruptionRating = ?");
        values.push(edit.corruptionRating);
    }
    if (edit.pcpRating !== undefined) {
        fields.push("pcpRating = ?");
        values.push(edit.pcpRating);
    }
    if (edit.accessibilityRating !== undefined) {
        fields.push("accessibilityRating = ?");
        values.push(edit.accessibilityRating);
    }

    if (fields.length === 0) {
        throw new Error("no fields were provided to edit");
    }

    values.push(id);

    const query = `
        UPDATE experiences
        SET ${fields.join(", ")}
        WHERE id = ?
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