import type { APIContext } from "astro";
import { Auth } from "../../../lib/auth";
import { env } from "cloudflare:workers";
import { BadRequestError } from "../../../lib/errors";

/**
 * Get a new access token through refresh token. 
 * Set revoke_old=true to revoke previous tokens.
 * @returns 
 */
export async function GET({ cookies, request }: APIContext) {
    try {
        const token = cookies.get("refresh_token");
        if (!token) throw new BadRequestError(["refresh_token"]);

        const params = new URLSearchParams(request.url);
        const revokeOld = params.get("revoke_old") || "false";

        if (revokeOld !== null && !["true", "false"].includes(revokeOld)) return new Response();

        const auth = new Auth(env.DB);
        try {
            const u = await auth.getUser(token.value, (revokeOld as unknown) as boolean);

            return new Response(JSON.stringify(u));
        } catch (error) {
            console.error(error);
            return new Response("err -- i do ts later");
        }
    } catch (error) {

    }
}