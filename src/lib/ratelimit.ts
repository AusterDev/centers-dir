import { REDIS } from "./cache"
import { ApplicationError } from "./errors";

export const RatelimitManager = {
    async update(userID: number, ttl: number, counter: number) {
        try {
            await REDIS.setex(`${userID}`, ttl, counter + 1);
        } catch (error) {
            throw new ApplicationError("TYPE_ERROR", error);
        }
    },

    async examine(userID: number) {
        try {
            const counter = Number(await REDIS.getex(`${userID}`)) || 0;
            let ttl = Number(await REDIS.ttl(`${userID}`));

            if (ttl < 0) {
                ttl = 5;
            }

            if (counter >= 10 && ttl > 0) {
                return false;
            } 
            
            await this.update(userID, ttl, counter);
            return true;
        } catch (error) {
            throw new ApplicationError("TYPE_ERROR", error);
        }
    }
}