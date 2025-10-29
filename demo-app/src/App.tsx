import React, { useState } from 'react';
import { Home } from './pages/Home';
import { CreateTrip } from './pages/CreateTrip';
import { GroupDetail } from './pages/GroupDetail';
import { StewardDashboard } from './pages/StewardDashboard';
import { ActiveTrip } from './pages/ActiveTrip';
export function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const handleNavigate = (page: string, groupId?: string) => {
    setCurrentPage(page);
    if (groupId) {
      setSelectedGroupId(groupId);
    }
  };
  return <div className="w-full min-h-screen">
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'create-trip' && <CreateTrip onNavigate={handleNavigate} />}
      {currentPage === 'group-detail' && selectedGroupId && <GroupDetail groupId={selectedGroupId} onNavigate={handleNavigate} />}
      {currentPage === 'steward' && <StewardDashboard onNavigate={handleNavigate} />}
      {currentPage === 'active-trip' && selectedGroupId && <ActiveTrip groupId={selectedGroupId} onNavigate={handleNavigate} />}
    </div>;
}