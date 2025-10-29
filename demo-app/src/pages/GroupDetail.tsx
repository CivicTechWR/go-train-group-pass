import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, DollarSignIcon, ArrowRightIcon, TrainIcon, EyeIcon } from 'lucide-react';
import { mockGroups, currentUser } from '../data/mockData';
import { Group, GroupMember } from '../types';
interface GroupDetailProps {
  groupId: string;
  onNavigate: (page: string, groupId?: string) => void;
}
export function GroupDetail({
  groupId,
  onNavigate
}: GroupDetailProps) {
  const [group, setGroup] = useState<Group>(mockGroups.find(g => g.id === groupId)!);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [appearance, setAppearance] = useState('');
  const isUserInGroup = group.members.some(m => m.userId === currentUser.id);
  const userMember = group.members.find(m => m.userId === currentUser.id);
  const isSteward = group.stewardId === currentUser.id;
  const handleJoinGroup = () => {
    if (group.members.length >= 5) {
      alert('Group is full');
      return;
    }
    const newMember: GroupMember = {
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      confirmedAttendance: false,
      paymentStatus: 'pending'
    };
    setGroup({
      ...group,
      members: [...group.members, newMember]
    });
  };
  const handleConfirmAttendance = () => {
    setShowAppearanceModal(true);
  };
  const handleSubmitAppearance = () => {
    const updatedMembers = group.members.map(m => m.userId === currentUser.id ? {
      ...m,
      confirmedAttendance: true,
      appearance: appearance || undefined
    } : m);
    setGroup({
      ...group,
      members: updatedMembers,
      status: 'ready'
    });
    setShowAppearanceModal(false);
    setAppearance('');
  };
  const handleUpdateAppearance = () => {
    const currentAppearance = userMember?.appearance || '';
    setAppearance(currentAppearance);
    setShowAppearanceModal(true);
  };
  const handleBecomeSteward = () => {
    setGroup({
      ...group,
      stewardId: currentUser.id
    });
  };
  const handlePurchasePass = () => {
    const confirmedCount = group.members.filter(m => m.confirmedAttendance).length;
    const pricePerPerson = confirmedCount === 2 ? 15 : confirmedCount === 3 ? 12 : confirmedCount === 4 ? 10 : 8;
    const totalPrice = pricePerPerson * confirmedCount;
    const updatedMembers = group.members.map(m => m.confirmedAttendance ? {
      ...m,
      amountOwed: pricePerPerson
    } : m);
    setGroup({
      ...group,
      members: updatedMembers,
      passPrice: totalPrice,
      status: 'at_station'
    });
  };
  const handleBoardTrain = () => {
    setGroup({
      ...group,
      status: 'on_train'
    });
    onNavigate('active-trip', group.id);
  };
  const handleMarkPaid = (userId: string) => {
    const updatedMembers = group.members.map(m => m.userId === userId ? {
      ...m,
      paymentStatus: 'paid'
    } : m);
    setGroup({
      ...group,
      members: updatedMembers
    });
  };
  const confirmedCount = group.members.filter(m => m.confirmedAttendance).length;
  const paidCount = group.members.filter(m => m.paymentStatus === 'paid').length;
  const showFindYourGroup = (group.status === 'ready' || group.status === 'at_station') && isUserInGroup;
  return <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="p-1 hover:bg-blue-700 rounded">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Round-Trip Group</h1>
          <p className="text-sm text-blue-100">{group.date}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Appearance Modal */}
        {showAppearanceModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                How will you look?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Help your group find you at the station. Describe what you'll be
                wearing.
              </p>
              <input type="text" value={appearance} onChange={e => setAppearance(e.target.value)} placeholder="e.g., Red jacket, black backpack" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4" autoFocus />
              <div className="text-xs text-gray-500 mb-4">
                Examples: "Blue coat, grey scarf" • "Black hoodie, rolling
                suitcase" • "Green parka, coffee cup"
              </div>
              <div className="flex gap-3">
                <button onClick={() => {
              setShowAppearanceModal(false);
              setAppearance('');
            }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSubmitAppearance} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Confirm
                </button>
              </div>
            </div>
          </div>}

        {/* Find Your Group - Prominent when at station */}
        {showFindYourGroup && <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <EyeIcon className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-orange-900">
                Find Your Group at the Station
              </h2>
            </div>
            <div className="space-y-2">
              {group.members.filter(m => m.confirmedAttendance).map(member => <div key={member.userId} className="bg-white rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {member.userName}
                          {member.userId === currentUser.id && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>}
                          {group.stewardId === member.userId && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Steward
                            </span>}
                        </div>
                        {member.appearance ? <div className="text-sm text-gray-700 mt-1 font-medium">
                            👀 {member.appearance}
                          </div> : <div className="text-sm text-gray-400 mt-1 italic">
                            No description yet
                          </div>}
                      </div>
                      {member.userId === currentUser.id && <button onClick={handleUpdateAppearance} className="text-xs text-blue-600 hover:text-blue-700 ml-2">
                          {member.appearance ? 'Update' : 'Add'}
                        </button>}
                    </div>
                  </div>)}
            </div>
          </div>}

        {/* Trip Details */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-gray-900 mb-4">Trip Details</h2>

          {/* Outbound */}
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Outbound</h3>
            </div>
            <div className="ml-7 space-y-1 text-sm">
              <div className="text-gray-900">
                {group.outbound.fromStation} → {group.outbound.toStation}
              </div>
              <div className="text-gray-600">
                Train:{' '}
                <span className="font-medium text-blue-600">
                  {group.outbound.selectedTime}
                </span>
              </div>
              {group.outbound.acceptableTimes.length > 1 && <div className="text-xs text-gray-500">
                  Group can take: {group.outbound.acceptableTimes.join(', ')}
                </div>}
            </div>
          </div>

          {/* Return */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Return</h3>
            </div>
            <div className="ml-7 space-y-1 text-sm">
              <div className="text-gray-900">
                {group.return.fromStation} → {group.return.toStation}
              </div>
              <div className="text-gray-600">
                Train:{' '}
                <span className="font-medium text-green-600">
                  {group.return.selectedTime}
                </span>
              </div>
              {group.return.acceptableTimes.length > 1 && <div className="text-xs text-gray-500">
                  Group can take: {group.return.acceptableTimes.join(', ')}
                </div>}
            </div>
          </div>
        </div>

        {!isUserInGroup && group.members.length < 5 && <button onClick={handleJoinGroup} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700">
            Join This Round-Trip Group
          </button>}

        {isUserInGroup && !userMember?.confirmedAttendance && <button onClick={handleConfirmAttendance} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Confirm I'll Be There
          </button>}

        {isUserInGroup && !group.stewardId && <button onClick={handleBecomeSteward} className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700">
            Volunteer as Steward
          </button>}

        {isSteward && group.status === 'ready' && confirmedCount >= 2 && <button onClick={handlePurchasePass} className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 flex items-center justify-center gap-2">
            <DollarSignIcon className="w-5 h-5" />
            Purchase Group Pass ({confirmedCount} people)
          </button>}

        {isUserInGroup && group.status === 'at_station' && <button onClick={handleBoardTrain} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2">
            <TrainIcon className="w-5 h-5" />
            Board Train (Start Trip)
          </button>}

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-gray-900 mb-3">
            Group Members ({group.members.length}/5)
          </h2>
          <div className="space-y-3">
            {group.members.map(member => <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {member.userName}
                    {group.stewardId === member.userId && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Steward
                      </span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {member.userPhone}
                  </div>
                  {member.amountOwed && <div className="text-sm font-medium text-green-600 mt-1">
                      Owes: ${member.amountOwed}
                    </div>}
                </div>
                <div className="flex items-center gap-2">
                  {member.confirmedAttendance ? <CheckCircleIcon className="w-5 h-5 text-green-600" /> : <XCircleIcon className="w-5 h-5 text-gray-400" />}
                  {isSteward && member.amountOwed && member.paymentStatus === 'pending' && <button onClick={() => handleMarkPaid(member.userId)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                        Mark Paid
                      </button>}
                  {member.paymentStatus === 'paid' && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Paid
                    </span>}
                </div>
              </div>)}
          </div>
        </div>

        {group.passPrice && <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2">Pass Purchased!</h3>
            <p className="text-sm text-green-800">
              Total: ${group.passPrice} | Paid: {paidCount}/{confirmedCount}
            </p>
          </div>}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">How It Works</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Groups are randomly assigned shortly before departure</li>
            <li>Confirm attendance and describe how you'll look</li>
            <li>Find your group at the station using their descriptions</li>
            <li>Steward purchases the group pass</li>
            <li>Board the train together</li>
            <li>
              If a fare inspector comes, use the alert button to reconvene
            </li>
          </ol>
        </div>
      </div>
    </div>;
}