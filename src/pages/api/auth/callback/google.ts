import type { APIContext, AstroCookies } from "astro";
import { Auth, Google } from "../../../../lib/auth";
import { ApplicationError, BadRequestError, InternalServerError } from "../../../../lib/errors";
import { env } from "cloudflare:workers";
import { getUser } from "../../../../lib/users.data";
import { generateTokens, type TokenBudle } from "../../../../lib/jwt";

type LocalResponseBody = {
    error: ApplicationError;
    status: number;
}

function setTokens(cookies: AstroCookies, tokens: TokenBudle) {
    cookies.set("access_token", tokens.accessToken, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 15,
        path: "/"
    });

    cookies.set("refresh_token", tokens.refreshToken, {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
    });
}

function errorPage(params: LocalResponseBody) {
    const searchParams = new URLSearchParams({
        status: params.status.toString(),
        error: JSON.stringify(params.error),
    });
    return `/error?${searchParams.toString()}`;
}

export async function GET({ cookies, request, redirect }: APIContext) {
    const auth = new Auth(env.DB);
    
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    try {
        if (!code) throw new BadRequestError(["code"]);

        const googleToken = await Google.getToken(code);
        if (!googleToken) throw new ApplicationError("auth", "google token is null");
        if (!googleToken.id_token) throw new ApplicationError("auth", "google.id_token is null");

        const googleUser = Google.getUser(googleToken.id_token);
        
        const existingUser = await getUser(env.DB, null, googleUser.email);
        if (existingUser) {
            const tokens = generateTokens(existingUser.id);
            setTokens(cookies, tokens);
            return redirect("/");
        }

        const newUser = await auth.registerUser(googleUser);
        setTokens(cookies, newUser.tokens);
        
        return redirect("/");
    } catch (error: any) {
        if (error instanceof BadRequestError) {
            return redirect(errorPage({
                status: 400,
                error: (error as unknown) as BadRequestError,
            }));
        } else {
            console.error("Auth callback error:", error);
            return redirect(errorPage({
                status: 500,
                error: new InternalServerError(),
            }));
        }
    }
}