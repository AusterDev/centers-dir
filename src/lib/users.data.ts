import type { D1Database } from "@cloudflare/workers-types";
import type { User } from "../models/common";
import { PERMISSIONS, PermsManager } from "./permissions";

type UserBasic = {
    email: string,
    username: string,
    source: string,
}

type UserEdit = {
    username?: string,
    permissions?: number,
}

export async function createUser(db: D1Database, basics: UserBasic): Promise<User> {
    const query = `INSERT INTO users (email, username, authSource, permissions) VALUES(?, ?, ?, ?)`;

    const perms = PermsManager.combine(PERMISSIONS.CREATE_POST, PERMISSIONS.DELETE_POST, PERMISSIONS.EDIT_POST);

    try {
        const newUser = await db.prepare(query)
            .bind(basics.email, basics.source, perms)
            .first<User>();

        if (!newUser) {
            throw new Error("failed to create user");
        }
        return newUser;
    } catch (error: any) {
        if (error.message && error.message.includes("UNIQUE constraint failed")) {
            throw new Error("user with this email already exists");
        }
        throw error;
    }
}

export async function getUser(db: D1Database, id?: number, email?: string): Promise<User> {
    const selectionMethod = id && !email ? "id" : "email";
    const query = `SELECT * FROM users WHERE ${selectionMethod} = ?`;

    try {
        const user = await db.prepare(query)
            .bind(id || email)
            .first<User>();

        if (!user) {
            throw new Error("user does not exist");
        }
        return user;
    } catch (error: any) {
        throw error;
    }
}

export async function editUser(db: D1Database, id: string, edit: UserEdit): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];

    if (edit.username) {
        fields.push("username = ?");
        values.push(edit.username);
    }

    if (edit.permissions) {
        fields.push("permissions = ?");
        values.push(edit.permissions);
    }

    if (fields.length === 0) {
        throw new Error("no fields were provided to edit");
    }

    values.push(id);

    const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = ?
        RETURNING *;
    `;
    try {
        const updatedUser = await db.prepare(query)
            .bind(values)
            .first<User>();

        if (!updatedUser) {
            throw new Error("failed to update user");
        }
        return updatedUser;
    } catch (error: any) {
        if (error.message && error.message.includes("UNIQUE constraint failed")) {
            throw new Error("user with this email already exists");
        }
        throw error;
    }
}