import React from 'react';
import { ArrowLeftIcon, DollarSignIcon, UsersIcon, ArrowRightIcon } from 'lucide-react';
import { mockGroups, currentUser } from '../data/mockData';
interface StewardDashboardProps {
  onNavigate: (page: string, groupId?: string) => void;
}
export function StewardDashboard({
  onNavigate
}: StewardDashboardProps) {
  const stewardGroups = mockGroups.filter(g => g.stewardId === currentUser.id);
  const totalOwed = stewardGroups.reduce((sum, group) => {
    const unpaidMembers = group.members.filter(m => m.paymentStatus === 'pending' && m.amountOwed);
    return sum + unpaidMembers.reduce((memberSum, m) => memberSum + (m.amountOwed || 0), 0);
  }, 0);
  return <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="p-1 hover:bg-purple-700 rounded">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Steward Dashboard</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <UsersIcon className="w-5 h-5" />
              <span className="text-sm">Active Groups</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stewardGroups.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <DollarSignIcon className="w-5 h-5" />
              <span className="text-sm">Total Owed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">${totalOwed}</div>
          </div>
        </div>

        <div className="space-y-4">
          {stewardGroups.length === 0 ? <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              You're not stewarding any groups yet. Join a group and volunteer
              as steward!
            </div> : stewardGroups.map(group => {
          const unpaidCount = group.members.filter(m => m.paymentStatus === 'pending' && m.amountOwed).length;
          const totalGroupOwed = group.members.filter(m => m.paymentStatus === 'pending').reduce((sum, m) => sum + (m.amountOwed || 0), 0);
          return <div key={group.id} className="bg-white rounded-lg shadow p-4">
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      {group.date}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ArrowRightIcon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {group.outbound.fromStation} →{' '}
                          {group.outbound.toStation}
                        </span>
                        <span className="text-sm text-gray-600">
                          {group.outbound.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRightIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {group.return.fromStation} → {group.return.toStation}
                        </span>
                        <span className="text-sm text-gray-600">
                          {group.return.time}
                        </span>
                      </div>
                    </div>

                    {group.passPrice && <div className="mt-2 text-right">
                        <div className="text-sm text-gray-600">Pass Price</div>
                        <div className="font-bold text-gray-900">
                          ${group.passPrice}
                        </div>
                      </div>}
                  </div>

                  {unpaidCount > 0 && <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                      <div className="text-sm font-medium text-yellow-900">
                        {unpaidCount} {unpaidCount === 1 ? 'person' : 'people'}{' '}
                        still owe ${totalGroupOwed}
                      </div>
                    </div>}

                  <div className="space-y-2">
                    {group.members.filter(m => m.amountOwed).map(member => <div key={member.userId} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-gray-900">
                              {member.userName}
                            </span>
                            <span className="text-gray-600 ml-2">
                              {member.userPhone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              ${member.amountOwed}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${member.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {member.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        </div>)}
                  </div>

                  <button onClick={() => onNavigate('group-detail', group.id)} className="w-full mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
                    View Group Details
                  </button>
                </div>;
        })}
        </div>
      </div>
    </div>;
}