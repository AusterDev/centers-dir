import z from "zod";
import { offset, order, select } from "./common";

export const GetUsersRequest = z.object({
    id: z.string().optional(),
    email: z.email().optional(),
    username: z.string().optional(),
    select: select,
    order: order.default("ascending"),
    offset: offset,
});