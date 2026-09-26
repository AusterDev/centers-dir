import jwt from "jsonwebtoken";

export type TokenBudle = {
    accessToken: string,
    refreshToken: string,
}

export type JWT = {
    exp: number,
    sub: {
        id: number,
    },
    typ: "refresh" | "access",
    tokenID: string,
}

/**
 * Generate a pair of tokens: access and refresh.
 * @param userID 
 * @returns TokenBundle
 * @throws jwt.JsonWebToken
 */
export function generateTokens(userID: number): TokenBudle {
    const sharedTokenID = crypto.randomUUID().toString();
    const sub = {
        id: userID,
    }

    const accessExp = Math.floor(Date.now() / 1000) + (15 * 60);
    const accessJWT: JWT = {
        exp: accessExp,
        sub: sub,
        tokenID: sharedTokenID,
        typ: "access"
    };
    const accessToken = jwt.sign(accessJWT, import.meta.env.JWT_SECRET);

    const refreshExp = Math.floor(Date.now() / 1000) + (7 * 60 * 60 * 24);
    const refreshJWT: JWT = {
        exp: refreshExp,
        sub: sub,
        tokenID: sharedTokenID,
        typ: "refresh",
    };
    const refreshToken = jwt.sign(refreshJWT, import.meta.env.JWT_SECRET);

    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
    }

}

/**
 * Verify token and return JWT object.
 * @param token 
 * @returns JWT
 * @throws jwt.TokenExpiredError
 * @throws TypeError
 * @throws jwt.JsonWebTokenError
 */
export function verifyToken(token: string): JWT {
    const payload = (jwt.verify(token, import.meta.env.JWT_SECRET) as unknown) as JWT;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new jwt.TokenExpiredError("token expired", new Date(payload.exp));
    }
    return payload;
}