import z from "zod";
import { offset, order, select } from "./common";

const areaPin = z.number().refine((n) => {
    let tmp = Math.abs(n);
    let count = 0;

    if (tmp === 0) {
        count = 1;
    }
    while (tmp > 0) {
        tmp = Math.floor(tmp / 10);
        count++;
    }

    return count === 5;
});

export const PostCentersRequest = z.object({
    name: z.string().max(100),
    address: z.string().max(400),
    areaPin: areaPin,
    gmapsLink: z.url(),
});

export const GetCentersRequest = z.object({
    address: z.string().max(400).optional(),
    name: z.string().optional(),
    areaPin: areaPin.optional(),
    originalPosterID: z.number().optional(),
    select: select,
    order: order.default("ascending"),
    offset: offset,
});

export const UpdateCenterRequest = z.object({
    id: z.number(),
    name: z.string().max(100).optional(),
    address: z.string().max(400).optional(),
    areaPin: areaPin.optional(),
    gMapsLink: z.url().optional(),
});