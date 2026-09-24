import z from "zod";

const select = z.number().max(40);
const order = z.enum(["ascending", "descending"]);

export const GetUsersRequest = z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    username: z.string().optional(),
    select: select,
    order: order,
})