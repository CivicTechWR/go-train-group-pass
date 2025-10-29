import React from 'react';
import { Group } from '../types';
import { UsersIcon, ClockIcon, MapPinIcon } from 'lucide-react';
interface GroupCardProps {
  group: Group;
  onViewDetails: (groupId: string) => void;
}
export function GroupCard({
  group,
  onViewDetails
}: GroupCardProps) {
  const getStatusColor = (status: Group['status']) => {
    switch (status) {
      case 'forming':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'at_station':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusLabel = (status: Group['status']) => {
    switch (status) {
      case 'forming':
        return 'Forming';
      case 'ready':
        return 'Ready';
      case 'at_station':
        return 'At Station';
      case 'completed':
        return 'Completed';
    }
  };
  const spotsLeft = 5 - group.members.length;
  return <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500 mb-2">
            {group.date}
          </div>

          {/* Outbound */}
          <div className="flex items-center gap-2 mb-1">
            <MapPinIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">
              {group.outbound.fromStation} → {group.outbound.toStation}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 ml-6">
            <ClockIcon className="w-4 h-4" />
            <span>
              {group.outbound.selectedTime || group.outbound.acceptableTimes.join(', ')}
            </span>
          </div>

          {/* Return */}
          <div className="flex items-center gap-2 mb-1">
            <MapPinIcon className="w-4 h-4 text-green-600" />
            <span className="font-medium text-gray-900">
              {group.return.fromStation} → {group.return.toStation}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
            <ClockIcon className="w-4 h-4" />
            <span>
              {group.return.selectedTime || group.return.acceptableTimes.join(', ')}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
          {getStatusLabel(group.status)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="w-4 h-4" />
          <span>
            {group.members.length}/5 members
            {spotsLeft > 0 && <span className="text-green-600 ml-1">
                ({spotsLeft} spots left)
              </span>}
          </span>
        </div>
        <button onClick={() => onViewDetails(group.id)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View Details
        </button>
      </div>
    </div>;
}