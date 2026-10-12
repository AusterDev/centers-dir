import { env } from "cloudflare:workers";
import { MissingPermissionsError } from "../../../lib/errors";
import { PERMISSIONS, PermsManager } from "../../../lib/permissions";
import { PostExpRequest, UpdateExpRequest } from "../../../requests/api/exp";
import { buildResponse, handleErrors } from "../../../responses/wrapper";
import { createExperience, editExperience } from "../../../lib/exp.data";
import { computeCorruptionRating, getAvgRating } from "../../../lib/computeutils";
import type { APIContext } from "astro";


/**
 * Add a new experience to a center. 
 * @returns Response
 */
export async function POST({ locals, logger, request }: APIContext) {
    try {
        const user = locals.currentUser.user;

        const requiredPerms = PermsManager.combine(PERMISSIONS.CREATE_EXP);

        if (!PermsManager.has(user.permissions, requiredPerms)) {
            throw new MissingPermissionsError([PERMISSIONS.CREATE_EXP]);

        }
        const data = await request.json();
        const req = await PostExpRequest.parseAsync(data);


        const ratings = {
            overallRating: 1,
            supportiveStaffRating: req.supportiveStaffRating,
            infraRating: req.infraRating,
            pcpRating: req.pcpRating,
            accessibilityRating: req.accessibilityRating,
            corruptionRating: computeCorruptionRating(req.supportiveStaffRating, req.askedForBribes),
        }

        ratings.overallRating = getAvgRating(
            ratings.accessibilityRating,
            ratings.corruptionRating,
            ratings.infraRating,
            ratings.pcpRating,
            ratings.supportiveStaffRating,
        );

        const newExp = await createExperience(env.DB, {
            ...ratings,
            msg: req.msg || "",
            centerID: req.centerID,
        });

        return buildResponse(200, JSON.stringify(newExp), null);
    } catch (error: any) {
        return handleErrors(logger, error);
    }
}

/**
 * Update the message in the experience. Does not include ratings. 
 */
export async function PUT({ locals, logger, request }: APIContext) {
    try {
        const user = locals.currentUser.user;

        const data = await request.json();
        const req = await UpdateExpRequest.parseAsync(data);

        const updatedExp = await editExperience(env.DB, req.id, {
            ...req,
            originalPosterID: user.id,
        });

        return buildResponse(200, JSON.stringify(updatedExp), null);
    } catch (error: any) {
        return handleErrors(logger, error);
    }
}
