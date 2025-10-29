import React, { useState } from 'react';
import { ArrowLeftIcon, AlertTriangleIcon, CheckCircleIcon, UsersIcon, MapPinIcon, EyeIcon } from 'lucide-react';
import { mockGroups, currentUser } from '../data/mockData';
import { Group } from '../types';
interface ActiveTripProps {
  groupId: string;
  onNavigate: (page: string) => void;
}
export function ActiveTrip({
  groupId,
  onNavigate
}: ActiveTripProps) {
  const [group, setGroup] = useState<Group>(mockGroups.find(g => g.id === groupId)!);
  const handleTriggerAlert = () => {
    const newAlert = {
      triggeredBy: currentUser.id,
      triggeredByName: currentUser.name,
      timestamp: new Date().toISOString(),
      acknowledged: [currentUser.id]
    };
    setGroup({
      ...group,
      fareInspectorAlert: newAlert
    });
  };
  const handleAcknowledgeAlert = () => {
    if (group.fareInspectorAlert) {
      const updatedAlert = {
        ...group.fareInspectorAlert,
        acknowledged: [...group.fareInspectorAlert.acknowledged, currentUser.id]
      };
      setGroup({
        ...group,
        fareInspectorAlert: updatedAlert
      });
    }
  };
  const handleCompleteTrip = () => {
    setGroup({
      ...group,
      status: 'completed'
    });
    onNavigate('home');
  };
  const hasActiveAlert = group.fareInspectorAlert && new Date().getTime() - new Date(group.fareInspectorAlert.timestamp).getTime() < 300000; // 5 min
  const hasAcknowledged = group.fareInspectorAlert?.acknowledged.includes(currentUser.id);
  return <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="p-1 hover:bg-green-700 rounded">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Active Trip</h1>
          <p className="text-sm text-green-100">Currently on train</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Active Alert */}
        {hasActiveAlert && !hasAcknowledged && <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 text-lg mb-1">
                  Fare Inspector Alert!
                </h3>
                <p className="text-red-800 mb-3">
                  {group.fareInspectorAlert?.triggeredByName} has triggered an
                  alert. Please reconvene with your group now.
                </p>
                <button onClick={handleAcknowledgeAlert} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
                  I'm Coming!
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-sm text-red-700">
                {group.fareInspectorAlert?.acknowledged.length} of{' '}
                {group.members.length} members acknowledged
              </p>
            </div>
          </div>}

        {/* Fare Inspector Button */}
        {!hasActiveAlert && <button onClick={handleTriggerAlert} className="w-full bg-red-600 text-white py-4 px-4 rounded-lg font-bold text-lg hover:bg-red-700 flex items-center justify-center gap-3 shadow-lg">
            <AlertTriangleIcon className="w-6 h-6" />
            Fare Inspector Alert!
          </button>}

        {/* Trip Info */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-green-600" />
            Current Trip
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium text-gray-900">
                {group.outbound.fromStation} → {group.outbound.toStation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Train:</span>
              <span className="font-medium text-gray-900">
                {group.outbound.selectedTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Group Size:</span>
              <span className="font-medium text-gray-900">
                {group.members.length} people
              </span>
            </div>
          </div>
        </div>

        {/* Group Members with Appearance */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-blue-600" />
            Your Group
          </h2>
          <div className="space-y-2">
            {group.members.map(member => <div key={member.userId} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-gray-900">
                    {member.userName}
                    {group.stewardId === member.userId && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Steward
                      </span>}
                    {member.userId === currentUser.id && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        You
                      </span>}
                  </div>
                  {hasActiveAlert && group.fareInspectorAlert?.acknowledged.includes(member.userId) && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                </div>
                {member.appearance && <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                    <EyeIcon className="w-4 h-4 text-gray-400" />
                    <span>{member.appearance}</span>
                  </div>}
                <div className="text-sm text-gray-600 mt-1">
                  {member.userPhone}
                </div>
              </div>)}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">
            Fare Inspector Protocol
          </h3>
          <p className="text-sm text-blue-800">
            If a fare inspector boards the train, tap the alert button
            immediately. All group members will be notified to reconvene and
            show the group pass together.
          </p>
        </div>

        {/* Complete Trip */}
        <button onClick={handleCompleteTrip} className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700">
          Mark Trip as Complete
        </button>
      </div>
    </div>;
}