import { z } from 'zod';

export enum GroupFormationResultFailureReason {
  NOT_ENOUGH_BOOKINGS = 'not_enough_bookings',
  NO_STEWARD_CANDIDATE = 'no_steward_candidates',
  INSUFFICIENT_STEWARDS = 'insufficient_stewards',
}
export const GroupFormationResultSchema = z.object({
    groupsFormed: z.number(),
    usersGrouped: z.number(),
    usersNotGrouped: z.number(),
    stewardsNeeded: z.number(),
    failureReason: z
        .enum(GroupFormationResultFailureReason)
        .optional(),
});
