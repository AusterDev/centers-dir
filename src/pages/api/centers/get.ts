import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { GetCentersRequest } from "../../../requests/api/centers";
import { buildResponse, handleErrors } from "../../../responses/wrapper";

/**
 * Get listed or unlisted centers.
 * @returns Response
 */
export async function GET({ logger, request }: APIContext) {
    try {
        const url = new URL(request.url);
        const reqData = Object.fromEntries(url.searchParams.entries());
        const req = await GetCentersRequest.parseAsync(reqData);

        const conditions: string[] = [];
        const bindings: any[] = [];

        if (req.name) {
            conditions.push("name LIKE ?");
            bindings.push(`%${req.name}%`);
        }
        if (req.address) {
            conditions.push("address LIKE ?");
            bindings.push(`%${req.address}%`);
        }
        if (req.areaPin) {
            conditions.push("areaPin = ?");
            bindings.push(req.areaPin);
        }
        if (req.originalPosterID) {
            conditions.push("originalPosterID = ?");
            bindings.push(req.originalPosterID);
        }

        let query = `SELECT * FROM users`;
        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        query += ` LIMIT ? OFFSET ?`;
        bindings.push(req.select, req.offset);

        const stmt = env.DB.prepare(query);
        const results = await stmt.bind(...bindings).all();

        return buildResponse(200, results, null);

    } catch (error: any) {
        return handleErrors(logger, error);
    }
}