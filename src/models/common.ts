export type User = {
    id: number;
    email: string;
    username: string;
    authSource?: string;
    permissions: number;
}

export type Center = {
    id: number;
    centerName: string;
    centerAddress: string;
    areaPin: number;
    averageRating: number;
    gMapsLink: string;
    originalPosterID?: number | null;
}

export type Experience = {
    id: number;
    msg: string;
    overallRating: number;
    supportiveStaffRating?: number;
    infraRating?: number;
    corruptionRating?: number;
    pcpRating?: number;
    accessibilityRating?: number;
    originalPosterID?: number | null;
    centerID: number;
}