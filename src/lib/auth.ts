import type { D1Database } from "@cloudflare/workers-types";
import { generateTokens, verifyToken, type JWT, type TokenBudle } from "./jwt"
import { createUser, getUser } from "./users.data";
import type { User } from "../models/common";
import jwt from "jsonwebtoken";
import { ApplicationError, RecordConflictError, RecordNotFoundError, TokenRevokedError, TokenTimedoutError, UnexpectedRequestError } from "./errors";
import { PERMISSIONS, PermsManager } from "./permissions";
import { REDIS } from "./cache";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_API = "https://googleapis.com/oauth2/v3/";

const SCOPE = [
    "userinfo.profile",
    "userinfo.email",
];

type GoogleUser = {
    name: string,
    email: string,
    pfp: string,
}

export const Google = {
    oauth2(): string {
        const params = new URLSearchParams({
            "client_id": import.meta.env.GOOGLE_CLIENT_ID,
            "redirect_uri": import.meta.env.GOOGLE_CALLBACK_URI,
            "response_type": "code",
            "scope": SCOPE.map((scope) => "https://www.googleapis.com/auth/" + scope).join(" ")
        });

        return "https://accounts.google.com/o/oauth2/auth?" + params;
    },

    async getToken(code: string) {
        const params = new URLSearchParams({
            "code": code,
            "client_id": import.meta.env.GOOGLE_CLIENT_ID,
            "client_secret": import.meta.env.GOOGLE_CLIENT_SECRET,
            "redirect_uri": import.meta.env.GOOGLE_CALLBACK_URI,
            "grant_type": "authorization_code",
        });
        const res = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const d = await res.json();
        if (!res.ok) throw new Error(`google code exchange failed: ${d.error}`);

        return d;
    },

    async getUser(token: string): Promise<GoogleUser> {
        const url = GOOGLE_API + "userinfo";
        const res = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const d = await res.json()
        if (!res.ok) throw new Error(`fetching userinfo for this user failed: ${d.error}`);

        const { name, email, picture } = d;

        if (!name || !email || !picture) throw new Error("malformed google user: essential fields like name, email or picture are/is missing.");

        return {
            name: d.name,
            email: d.email,
            pfp: d.picture,
        };
    }
}

export class Auth {
    private db: D1Database;

    constructor(_db: D1Database) {
        this.db = _db;
    }

    public async registerUser({ name, email, pfp }: GoogleUser): Promise<{ user: User; tokens: TokenBudle; }> {
        try {
            const newUser = await createUser(this.db, {
                username: name,
                email: email,
                source: "google"
            });

            const tokenPair = generateTokens(newUser.id);
            return {
                user: newUser,
                tokens: tokenPair,
            }
        } catch (error: any) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ApplicationError("auth", error)
            }

            const msg = error?.message || String(error);
            if (msg.includes("email alrady exists") || msg.includes("SQLITE_CONSTRAINT")) {
                throw new RecordConflictError(error);
            }

            throw new ApplicationError(error.message);
        }
    }

    public async isBlocked(token: JWT) {
        if (await REDIS.get(token.tokenID)) {
            return true;
        }
        return false;
    }

    public async getUser(token: string, getNewAccessToken: boolean): Promise<{ user: User; tokens: TokenBudle | null; }> {
        try {
            const tok = await verifyToken(token);
            if (await this.isBlocked(tok)) throw new TokenRevokedError();

            const user = await getUser(this.db, tok.sub.id);

            if (getNewAccessToken) {
                if (tok.typ !== "refresh") throw new UnexpectedRequestError({ typ: "refresh" }, { typ: tok.typ }, "token must be a refresh token");

                const newTok = generateTokens(user.id);

                await REDIS.set(tok.tokenID, "refresh", {
                    ex: tok.exp - Math.floor(Date.now() / 1000),
                });
               
                return {
                    user: user,
                    tokens: newTok,
                }
            }
            return {
                user: user,
                tokens: null,
            }
        } catch (error: any) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new TokenTimedoutError(error);
            }

            const msg = error?.message || String(error);
            if (msg.includes("user not found") || msg.includes("SQLITE_CONSTRAINT")) {
                throw new RecordNotFoundError(error);
            }

            throw new ApplicationError(error);
        }
    }

    public async isAllowed(user: User, permissions: PERMISSIONS) {
        const perms = PermsManager.combine(permissions);
        return PermsManager.has(user.permissions, perms);
    }
}