import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { MissingPermissionsError } from "../../../lib/errors";
import { PERMISSIONS, PermsManager } from "../../../lib/permissions";
import { GetCentersRequest, PostCentersRequest, UpdateCenterRequest } from "../../../requests/api/centers";
import { createCenter, editCenter, getCenter } from "../../../lib/centers.data";
import { buildResponse, handleErrors } from "../../../responses/wrapper";

/**
 * List a new center. 
 * @returns Response
 */
export async function POST({ locals, logger, request }: APIContext) {
    try {
        const user = locals.currentUser.user;

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

export async function PUT({ locals, logger, request }: APIContext) {
    try {
        const user = locals.currentUser.user;

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
