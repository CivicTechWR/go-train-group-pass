interface User {
  id: string;
  displayName: string;
}

interface Group {
  groupNumber: number;
  members: User[];
  costPerPerson: number;
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

export function formGroups(users: User[]): Group[] {
  const count = users.length;

  if (count === 0) return [];

  if (count === 1) {
    // Solo rider - show individual ticket option
    return [{
      groupNumber: 1,
      members: [users[0]],
      costPerPerson: 16.32, // Individual Presto fare KW→Union
    }];
  }

  if (count <= 5) {
    return [{
      groupNumber: 1,
      members: users,
      costPerPerson: calculateCostPerPerson(count),
    }];
  }

  // For 6+ riders: distribute evenly
  // Goal: avoid unbalanced groups like 5+5+2, prefer 4+4+4
  const numGroups = Math.ceil(count / 5);
  const baseSize = Math.floor(count / numGroups);
  const remainder = count % numGroups;

  const groups: Group[] = [];
  let userIndex = 0;

  for (let i = 0; i < numGroups; i++) {
    // Distribute remainder across first N groups
    const size = baseSize + (i < remainder ? 1 : 0);
    const groupMembers = users.slice(userIndex, userIndex + size);

    groups.push({
      groupNumber: i + 1,
      members: groupMembers,
      costPerPerson: calculateCostPerPerson(size),
    });

    userIndex += size;
  }

  return groups;
}

// Export types for use in other modules
export type { User, Group };
