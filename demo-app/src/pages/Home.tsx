import React, { useState } from 'react';
import { PlusIcon, UsersIcon, TrainIcon } from 'lucide-react';
import { mockGroups, currentUser } from '../data/mockData';
import { GroupCard } from '../components/GroupCard';
interface HomeProps {
  onNavigate: (page: string, groupId?: string) => void;
}
export function Home({
  onNavigate
}: HomeProps) {
  const [filter, setFilter] = useState<'all' | 'forming' | 'ready'>('all');
  const myActiveTrips = mockGroups.filter(g => g.status === 'on_train' && g.members.some(m => m.userId === currentUser.id));
  const filteredGroups = mockGroups.filter(group => {
    if (group.status === 'on_train' || group.status === 'completed') return false;
    if (filter === 'all') return true;
    return group.status === filter;
  });
  return <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Metrolinx Group Pass</h1>
        <p className="text-blue-100">Save money by sharing group passes</p>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Active Trips */}
        {myActiveTrips.length > 0 && <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrainIcon className="w-5 h-5 text-green-600" />
              Active Trips
            </h2>
            <div className="space-y-3">
              {myActiveTrips.map(trip => <div key={trip.id} className="bg-green-50 border-2 border-green-500 rounded-lg p-4 cursor-pointer hover:bg-green-100" onClick={() => onNavigate('active-trip', trip.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900 mb-1">
                        {trip.outbound.fromStation} → {trip.outbound.toStation}
                      </div>
                      <div className="text-sm text-gray-600">
                        Train {trip.outbound.selectedTime} •{' '}
                        {trip.members.length} members
                      </div>
                    </div>
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      On Train
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}

        <div className="flex gap-3 mb-6">
          <button onClick={() => onNavigate('create-trip')} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Express Interest
          </button>
          <button onClick={() => onNavigate('steward')} className="bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Steward View
          </button>
        </div>

        <div className="mb-4">
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              All Groups
            </button>
            <button onClick={() => setFilter('forming')} className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'forming' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              Forming
            </button>
            <button onClick={() => setFilter('ready')} className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'ready' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              Ready
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-yellow-900 mb-2">How Groups Form</h3>
          <p className="text-sm text-yellow-800">
            Groups are finalized shortly before train departure. If there are N
            people interested, we create ⌊N÷5⌋ groups and randomly assign
            members. Example: 13 people = 2 groups of 5 + 1 group of 3.
          </p>
        </div>

        <div className="space-y-3">
          {filteredGroups.length === 0 ? <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No groups found. Be the first to express interest!
            </div> : filteredGroups.map(group => <GroupCard key={group.id} group={group} onViewDetails={id => onNavigate('group-detail', id)} />)}
        </div>
      </div>
    </div>;
}