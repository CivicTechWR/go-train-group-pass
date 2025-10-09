'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Crown } from 'lucide-react';
import type { GroupWithMemberships } from '@/types/database';

interface GroupCardProps {
  group: GroupWithMemberships;
  currentUserId?: string;
}

export function GroupCard({ group, currentUserId }: GroupCardProps) {
  const memberCount = group.memberships.length;
  const steward = group.memberships.find((m) => m.user_id === group.steward_id);
  const isCurrentUserSteward = group.steward_id === currentUserId;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Group {group.group_number}
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {memberCount} {memberCount === 1 ? 'person' : 'people'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Cost per person */}
        <div className="text-sm">
          <span className="text-muted-foreground">Cost: </span>
          <span className="font-semibold text-lg">
            ${group.cost_per_person.toFixed(2)}
          </span>
          <span className="text-muted-foreground">/person</span>
        </div>

        {/* Steward */}
        <div className="flex items-center justify-between">
          {steward ? (
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                Steward: <span className="font-medium">{steward.user?.display_name}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">No steward</span>
              {!isCurrentUserSteward && (
                <Button size="sm" variant="outline" disabled>
                  Volunteer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Members list */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase">Members</p>
          <div className="space-y-1">
            {group.memberships.map((membership) => (
              <div
                key={membership.id}
                className={`flex items-center gap-2 text-sm py-1 px-2 rounded ${
                  membership.user_id === currentUserId
                    ? 'bg-primary/10 font-medium'
                    : ''
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {membership.user?.display_name?.[0]?.toUpperCase() || '?'}
                </div>
                <span>
                  {membership.user?.display_name || 'Unknown'}
                  {membership.user_id === currentUserId && ' (You)'}
                </span>
                {membership.user_id === group.steward_id && (
                  <Crown className="h-3 w-3 text-yellow-600 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
