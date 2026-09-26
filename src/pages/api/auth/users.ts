import type { APIContext } from "astro";
import { Auth } from "../../../lib/auth";
import { env } from "cloudflare:workers";
import { BadRequestError } from "../../../lib/errors";
import { GetUsersRequest } from "../../../requests/api/user";
import { PERMISSIONS, PermsManager } from "../../../lib/permissions";
import { buildResponse, handleErrors } from "../../../responses/wrapper";

/**
 * Get information about a user. 
 * Trim sensitive information like email from response object if the target user is 
 * not the same as current user.
 * Bypass response trimming if current user has ADMIN permission.
 * @returns Response
 */
export async function GET({ cookies, logger, request }: APIContext) {
    try {
        const token = cookies.get("access_token");
        if (!token) throw new BadRequestError(["access_token"]);

        const auth = new Auth(env.DB);
        const { user: currentUser } = await auth.getUser(token.value, false);

        const url = new URL(request.url);
        const reqData = Object.fromEntries(url.searchParams.entries());
        const req = await GetUsersRequest.parseAsync(reqData);

        const conditions: string[] = [];
        const bindings: any[] = [];

        if (req.id) {
            conditions.push("id = ?");
            bindings.push(req.id);
        }
        if (req.email) {
            conditions.push("email = ?");
            bindings.push(req.email);
        }
        if (req.username) {
            conditions.push("username LIKE ?");
            bindings.push(`%${req.username}%`);
        }

        let query = `SELECT * FROM users`;
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        query += ` LIMIT ? OFFSET ?`;
        bindings.push(req.select, req.offset);

        const stmt = env.DB.prepare(query);
        const { results: targetUsers } = await stmt.bind(...bindings).all();

        const isAdmin = PermsManager.has(currentUser.permissions, PERMISSIONS.ADMIN);

        const sanitizedUsers = targetUsers.map((targetUser: any) => {
            const isSelf = currentUser.id === targetUser.id;

            if (!isSelf && !isAdmin) {
                const { email, ...rest } = targetUser;
                return rest;
            }

            return targetUser;
        });

        return buildResponse(200, sanitizedUsers, null);

    } catch (error: any) {
        return handleErrors(logger, error);
    }
}