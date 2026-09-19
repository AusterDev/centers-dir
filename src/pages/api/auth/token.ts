import type { APIContext } from "astro";
import { Auth } from "../../../lib/auth";

export async function GET({ request, locals }: APIContext) {
    const auth = new Auth(locals.runtime.env.DB);
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return new Response();

    const token = authHeader.replaceAll("Bearer ", "");
    try {
        const u = await auth.getUser(token, false);

        return new Response(JSON.stringify(u));
    } catch (error) {
        console.error(error);
        return new Response("err -- i do ts later");
    }
}

export async function POST({ request, locals }: APIContext) {
    try {
        const body = (request.json() as unknown) as GetTokenRequest;
        if (body.getNewAccessToken !== true) return new Response("wtv i put here later");

        const auth = new Auth(locals.runtime.env.DB);

        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return new Response();

        const token = authHeader.replaceAll("Bearer ", "");

        const u = await auth.getUser(token, true);

        return new Response(JSON.stringify(u));
    } catch (error) {
        console.error(error);
        return new Response("err -- i do ts later");
    }

}