import type { D1Database } from "@cloudflare/workers-types";
import type { Center } from "../models/common";

type CenterBasic = {
    centerName: string;
    centerAddress: string;
    areaPin: number;
    gMapsLink: string;
    originalPosterID?: number | null;
}

type CenterEdit = {
    centerName?: string;
    centerAddress?: string;
    areaPin?: number;
    gMapsLink?: string;
}

export async function createCenter(db: D1Database, basics: CenterBasic): Promise<Center> {
    const query = `
        INSERT INTO centers (centerName, centerAddress, areaPin, gMapsLink, originalPosterID) 
        VALUES (?, ?, ?, ?, ?) 
        RETURNING *;
    `;

    try {
        const newCenter = await db.prepare(query)
            .bind(
                basics.centerName, 
                basics.centerAddress, 
                basics.areaPin, 
                basics.gMapsLink, 
                basics.originalPosterID ?? null
            )
            .first<Center>();

        if (!newCenter) {
            throw new Error("failed to create center");
        }
        return newCenter;
    } catch (error: any) {
        throw error;
    }
}

export async function getCenter(db: D1Database, id: number): Promise<Center> {
    const query = `SELECT * FROM centers WHERE id = ?`;

    try {
        const center = await db.prepare(query)
            .bind(id)
            .first<Center>();

        if (!center) {
            throw new Error("center does not exist");
        }
        return center;
    } catch (error: any) {
        throw error;
    }
}

export async function editCenter(db: D1Database, id: number, edit: CenterEdit): Promise<Center> {
    const fields: string[] = [];
    const values: any[] = [];

    if (edit.centerName) {
        fields.push("centerName LIKE ?");
        values.push(`%${edit.centerName}%`);
    }
    if (edit.centerAddress) {
        fields.push("centerAddress LIKE ?");
        values.push(`%${edit.centerAddress}%`);
    }
    if (edit.areaPin) {
        fields.push("areaPin = ?");
        values.push(edit.areaPin);
    }
    if (edit.gMapsLink) {
        fields.push("gMapsLink = ?");
        values.push(edit.gMapsLink);
    }

    if (fields.length === 0) {
        throw new Error("no fields were provided to edit");
    }

    values.push(id);

    const query = `
        UPDATE centers
        SET ${fields.join(", ")}
        WHERE id = ?
        RETURNING *;
    `;

    try {
        const updatedCenter = await db.prepare(query)
            .bind(...values)
            .first<Center>();

        if (!updatedCenter) {
            throw new Error("failed to update center");
        }
        return updatedCenter;
    } catch (error: any) {
        throw error;
    }
}