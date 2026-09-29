/**
 * Do we really need docs for this shit?
 * @returns range: [1,5] -- not ARRAY ffs
 */
export function getAvgRating(firstRating: number, ...restRatings: number[]) {
    const ratings = [firstRating, ...restRatings];

    const total = ratings.reduce((sum, n) => sum + n, 0);
    return Math.max(1, Math.min(5, total / ratings.length));
}

/**
 * Compute corruption rating based on how the staff behaved with the learner and whether they asked for bribes.
 * Bribing contributes to 80% meanwhile the staff behaviour contributes 20%.
 * @param supportiveStaffRating 
 * @param bribesAsked 
 * @returns range: [1,5] -- again, not an ARRAY
 */
export function computeCorruptionRating(supportiveStaffRating: number, bribesAsked: boolean) {
    const askedForBribes = bribesAsked ? 1 : 0;
    const sWeight = 1 - ((supportiveStaffRating - 1) / 4);

    return 1 + 4 * ((0.8 * askedForBribes) + (0.2 * sWeight))
}