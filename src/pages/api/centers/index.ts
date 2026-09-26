import type { APIContext } from "astro";
import { Auth } from "../../../lib/auth";
import { env } from "cloudflare:workers";
import { BadRequestError, MissingPermissionsError } from "../../../lib/errors";
import { PERMISSIONS, PermsManager } from "../../../lib/permissions";
import { GetCentersRequest, PostCentersRequest, UpdateCenterRequest } from "../../../requests/api/centers";
import { createCenter, editCenter, getCenter } from "../../../lib/centers.data";
import { buildResponse, handleErrors } from "../../../responses/wrapper";

/**
 * List a new center. 
 * @returns Response
 */
export async function POST({ cookies, logger, request }: APIContext) {
    try {
        const token = cookies.get("access_token");
        console.log(token)
        if (!token) throw new BadRequestError(["access_token"]);

        const auth = new Auth(env.DB);
        const { user } = await auth.getUser(token.value, false);

        const requiredPerms = PermsManager.combine(PERMISSIONS.CREATE_POST);

        if (!PermsManager.has(user.permissions, requiredPerms)) {
            
        }
        const data = await request.json();
        const req = await PostCentersRequest.parseAsync(data);
        
        const newCenter = await createCenter(env.DB, {
            centerName: req.name,
            centerAddress: req.address,
            areaPin: req.areaPin,
            originalPosterID: user.id,
            gMapsLink: req.gmapsLink,
        });

        return buildResponse(200, JSON.stringify(newCenter), null);

    } catch (error: any) {
        return handleErrors(logger, error);
    }
}

/**
 * Get listed or unlisted centers.
 * @returns Response
 */
export async function GET({ cookies, logger, request }: APIContext) {
    try {
        const token = cookies.get("access_token");
        if (!token) throw new BadRequestError(["access_token"]);

        const auth = new Auth(env.DB);
        const { user } = await auth.getUser(token.value, false);

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
            if (!PermsManager.has(user.permissions, PermsManager.combine(PERMISSIONS.ADMIN))) {
                throw new MissingPermissionsError([PERMISSIONS.ADMIN]);
            }

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

export async function PUT({ cookies, logger, request }: APIContext) {
    try {
        const token = cookies.get("access_token");
        console.log(token)
        if (!token) throw new BadRequestError(["access_token"]);

        const auth = new Auth(env.DB);
        const { user } = await auth.getUser(token.value, false);

        const requiredPerms = PermsManager.combine(PERMISSIONS.EDIT_POST);

        const data = await request.json();
        const req = await UpdateCenterRequest.parseAsync(data);
        
        const existingCenter = await getCenter(env.DB, req.id);
        if (existingCenter.originalPosterID !== user.id) {
            if (PermsManager.has(user.permissions, requiredPerms)) {
                throw new MissingPermissionsError([PERMISSIONS.EDIT_POST]);
            }
        }

        const updatedCenter = await editCenter(env.DB, req.id, {
            centerAddress: req.address,
            centerName: req.name,
            areaPin: req.areaPin,
            gMapsLink: req.gMapsLink,
        });

        return new Response(JSON.stringify(updatedCenter), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        return handleErrors(logger, error);
    }
}
