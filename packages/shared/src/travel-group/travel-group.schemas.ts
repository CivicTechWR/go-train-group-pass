import z from "zod";

export const TravelGroupSchema = z.object({
    id: z.string(),
    tripId: z.string(),
    stewardId: z.string(),
});

export const TravelGroupMemberSchema = z.object({
    name: z.string(),
    email: z.string(),
    phoneNumber: z.e164(),
});

export const StewardSchema = TravelGroupMemberSchema;

export const TravelGroupMembersSchema = z.array(TravelGroupMemberSchema);