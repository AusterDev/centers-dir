import type { APIContext, MiddlewareNext } from "astro";
import { Auth } from "./lib/auth";
import { env } from "cloudflare:workers";
import { BadRequestError, RatelimitHitError, TokenMalformedError } from "./lib/errors";
import { handleErrors } from "./responses/wrapper";
import { RatelimitManager } from "./lib/ratelimit";

const PROTECTED_ROUTES = [
    "/api/auth/users",
    "/api/centers",
    "/api/exp",
    "/",
];

export async function onRequest(context: APIContext, next: MiddlewareNext) {
    try {
        const { url } = context;

        if (PROTECTED_ROUTES.includes(url.pathname)) {
            const accessToken = context.cookies.get("access_token");
            
            if (!accessToken) {
                if (url.pathname.startsWith("/api")) {
                    throw new BadRequestError(["access_token"]);
                }
                return context.redirect("/auth");
            }

            const auth = new Auth(env.DB);
            const currentUser = await auth.getUser(accessToken.value, false);

            if (!currentUser) {
                if (url.pathname.startsWith("/api")) {
                    throw new TokenMalformedError();
                }
                return context.redirect("/auth");
            }

            if (await RatelimitManager.examine(currentUser.user.id)) {
                throw new RatelimitHitError();
            }
            context.locals.currentUser = currentUser;
        }

        return next();
    } catch (error) {
        if (context.url.pathname.startsWith("/api")) {
            return handleErrors(context.logger, error);
        }
        return context.redirect("/auth");
    }
}