import z from "zod";
import { offset, order, select } from "./common";;

const rating = z.number().min(1).max(5).default(1);

const common = {
    msg: z.string().max(6000).optional(),
    supportiveStaffRating: rating,
    infraRating: rating,
    askedForBribes: z.boolean(),
    pcpRating: rating,
    accessibilityRating: rating,
    centerID: z.number(),
}

export const PostExpRequest = z.object({
    ...common,
});

export const GetExpRequest = z.object({
    id: z.number().optional(),
    centerID: z.number(),
    overallRating: rating.optional(),
    supportiveStaffRating: rating.optional(),
    infraRating: rating.optional(),
    askedForBribes: z.number().optional(),
    pcpRating: rating.optional(),
    accessibilityRating: rating.optional(),
    select: select,
    order: order.default("ascending"),
    offset: offset,
});

export const UpdateExpRequest = z.object({
    id: z.number(),
    centerID: z.number(),
    msg: z.string().max(6000).optional(),
});