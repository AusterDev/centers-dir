import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { buildResponse, handleErrors } from "../../../responses/wrapper";
import { getExperience } from "../../../lib/exp.data";
import { GetExpRequest } from "../../../requests/api/exp";

/**
 * Get listed or unlisted centers.
 * @returns Response
 */
export async function GET({ logger, request }: APIContext) {
    try {
        const url = new URL(request.url);
        const reqData = Object.fromEntries(url.searchParams.entries());
        const req = await GetExpRequest.parseAsync(reqData);

        const exp = await getExperience(env.DB, {
            id: req.id,
            centerID: req.centerID,
            overallRating: req.overallRating,
            supportiveStaffRating: req.supportiveStaffRating,
            infraRating: req.infraRating,
            corruptionRating: req.askedForBribes,
            pcpRating: req.pcpRating,
            accessibilityRating: req.accessibilityRating,
            select: req.select,
            order: req.order,
            offset: req.offset,
        });

        return buildResponse(200, exp, null);

    } catch (error: any) {
        return handleErrors(logger, error);
    }
}