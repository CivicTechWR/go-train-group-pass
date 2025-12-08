import { z } from 'zod';

export const GroupFormationResultSchema = z.object({
    tripId: z.string(),
    groupsFormed: z.number(),
    usersGrouped: z.number(),
    usersNotGrouped: z.number(),
    failedNoSteward: z.number(),
    failureReason: z
        .enum([
            'not_enough_bookings',
            'no_steward_candidates',
            'insufficient_stewards',
        ])
        .optional(),
});

export const GroupFormationResponseSchema = z.object({
    results: z.array(GroupFormationResultSchema),
});
