import z from "zod";

export const select = z.number().max(40).default(5);
export const order = z.enum(["ascending", "descending"]);
export const offset = z.number().min(0).default(0);
