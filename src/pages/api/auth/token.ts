import type { APIContext } from "astro";
import { Auth } from "../../../lib/auth";
import { env } from "cloudflare:workers";

export async function GET({ cookies, locals }: APIContext) {
    const token = cookies.get("auth_token");
    if (!token) return new Response("error -- no token in cookies");

    const auth = new Auth(env.DB);
    try {
        const u = await auth.getUser(token.value, false);

        return new Response(JSON.stringify(u));
    } catch (error) {
        console.error(error);
        return new Response("err -- i do ts later");
    }
}

export async function POST({ cookies, request, locals }: APIContext) {
    try {
        const token = cookies.get("auth_token");
        if (!token) return new Response("err -- no token in cookies");

        const body = (request.json() as unknown) as GetTokenRequest;
        if (body.getNewAccessToken !== true) return new Response("wtv i put here later");

        const auth = new Auth(env.DB);

        const u = await auth.getUser(token.value, true);

        return new Response(JSON.stringify(u));
    } catch (error) {
        console.error(error);
        return new Response("err -- i do ts later");
    }

}