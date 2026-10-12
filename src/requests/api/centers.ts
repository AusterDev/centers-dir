import z from "zod";
import { offset, order, select } from "./common";
import { getAllStates } from "country-state-city/lib/state";
import { Country } from "country-state-city";

const mediums = [
    "English",
    "Hindi",
];
const coursesAvailable = [
    "Senior Secondary",
    "Secondary",
    "OBE",
]

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

const location = {
    address: z.string().max(400),
    areaPin: areaPin,
    district: z.string().max(400),
    state: z.string().refine((s) => getAllStates().some(state => state.name === s)),
    country: z.string().refine((c) => Country.getAllCountries().some(cntry => cntry.name === c)),
};

const common = {
    aiCode: z.string(),
    centerActive: z.boolean().default(true),
    studyMedium: z.enum(mediums),
    udiseCODE: z.number().optional(),
    coursesAvailable: z.enum(coursesAvailable),
    gender: z.enum(["Co-Ed", "All-Boys", "All-Girls"]),
    mobileNumber: z.string(),
    emailID: z.email(),
}

export const PostCentersRequest = z.object({
    name: z.string().max(100),
    gmapsLink: z.url(),
    ...common,
});

export const GetCentersRequest = z.object({
    ...location,
    name: z.string().optional(),
    originalPosterID: z.number().optional(),
    select: select,
    order: order.default("ascending"),
    offset: offset,
    ...common,
});

export const UpdateCenterRequest = z.object({
    id: z.number(),
    name: z.string().max(100).optional(),
    address: z.string().max(400).optional(),
    areaPin: areaPin.optional(),
    gMapsLink: z.url().optional(),
    ...common,
});