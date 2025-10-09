interface User {
  id: string;
  displayName: string;
}

interface Group {
  groupNumber: number;
  members: User[];
  costPerPerson: number;
  stewardId?: string | null;
}

interface GroupFormationOptions {
  existingStewards?: Map<string, string>; // Map of userId -> groupNumber where they're steward
}

const PASS_COSTS = {
  5: 60,
  4: 50,
  3: 40,
  2: 30,
} as const;

function calculateCostPerPerson(groupSize: number): number {
  if (groupSize < 2 || groupSize > 5) throw new Error('Invalid group size');
  return PASS_COSTS[groupSize as keyof typeof PASS_COSTS] / groupSize;
}

export function formGroups(users: User[], options?: GroupFormationOptions): Group[] {
  const count = users.length;
  const existingStewards = options?.existingStewards || new Map();

  if (count === 0) return [];

  if (count === 1) {
    // Solo rider - show individual ticket option
    const stewardId = existingStewards.get(users[0].id) ? users[0].id : null;
    return [{
      groupNumber: 1,
      members: [users[0]],
      costPerPerson: 16.32, // Individual Presto fare KW→Union
      stewardId,
    }];
  }

  if (count <= 5) {
    // Find if any user was previously a steward
    const stewardId = users.find(u => existingStewards.has(u.id))?.id || null;
    return [{
      groupNumber: 1,
      members: users,
      costPerPerson: calculateCostPerPerson(count),
      stewardId,
    }];
  }

  // For 6+ riders: distribute evenly while preserving steward assignments
  const numGroups = Math.ceil(count / 5);
  const baseSize = Math.floor(count / numGroups);
  const remainder = count % numGroups;

  // Separate stewards from non-stewards to ensure they're distributed across groups
  const stewards = users.filter(u => existingStewards.has(u.id));
  const nonStewards = users.filter(u => !existingStewards.has(u.id));

  const groups: Group[] = [];
  let nonStewardIndex = 0;

  for (let i = 0; i < numGroups; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    const groupMembers: User[] = [];
    let stewardId: string | null = null;

    // Assign one steward per group if available
    if (i < stewards.length) {
      groupMembers.push(stewards[i]);
      stewardId = stewards[i].id;
    }

    // Fill remaining slots with non-stewards
    const slotsNeeded = size - groupMembers.length;
    const availableNonStewards = nonStewards.slice(nonStewardIndex, nonStewardIndex + slotsNeeded);
    groupMembers.push(...availableNonStewards);
    nonStewardIndex += availableNonStewards.length;

    groups.push({
      groupNumber: i + 1,
      members: groupMembers,
      costPerPerson: calculateCostPerPerson(size),
      stewardId,
    });
  }

  return groups;
}

// Export types for use in other modules
export type { User, Group, GroupFormationOptions };
