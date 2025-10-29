import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { getSchedule } from '../data/trainSchedules';
interface CreateTripProps {
  onNavigate: (page: string) => void;
}
export function CreateTrip({
  onNavigate
}: CreateTripProps) {
  const [stationA, setStationA] = useState('Union Station');
  const [stationB, setStationB] = useState('Oakville GO');
  const [date, setDate] = useState('');
  const [outboundTimes, setOutboundTimes] = useState<string[]>([]);
  const [returnTimes, setReturnTimes] = useState<string[]>([]);
  const stations = ['Union Station', 'Oakville GO', 'Burlington GO', 'Aldershot GO', 'Bronte GO', 'Port Credit GO'];
  const outboundSchedule = getSchedule(stationA, stationB);
  const returnSchedule = getSchedule(stationB, stationA);
  const handleOutboundTimeToggle = (time: string) => {
    setOutboundTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };
  const handleReturnTimeToggle = (time: string) => {
    setReturnTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outboundTimes.length === 0 || returnTimes.length === 0) {
      alert('Please select at least one train time for both outbound and return trips.');
      return;
    }
    alert('Trip interest created! You will be matched with a group for your round-trip journey.');
    onNavigate('home');
  };
  return <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="p-1 hover:bg-blue-700 rounded">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Express Round-Trip Interest</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Select all train times that work for you.</strong> We'll
              match you with others who have overlapping schedules.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station A
              </label>
              <select value={stationA} onChange={e => {
              setStationA(e.target.value);
              setOutboundTimes([]);
              setReturnTimes([]);
            }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                {stations.map(station => <option key={station} value={station}>
                    {station}
                  </option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station B
              </label>
              <select value={stationB} onChange={e => {
              setStationB(e.target.value);
              setOutboundTimes([]);
              setReturnTimes([]);
            }} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                {stations.map(station => <option key={station} value={station}>
                    {station}
                  </option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>

          {/* Outbound Trip */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">
                Outbound: {stationA} → {stationB}
              </h3>
            </div>

            {outboundSchedule ? <div>
                <p className="text-sm text-gray-600 mb-3">
                  Select all trains you can take:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {outboundSchedule.departureTimes.map(time => <label key={time} className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${outboundTimes.includes(time) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={outboundTimes.includes(time)} onChange={() => handleOutboundTimeToggle(time)} className="sr-only" />
                      <span className="font-medium">{time}</span>
                    </label>)}
                </div>
                {outboundTimes.length > 0 && <p className="text-sm text-blue-600 mt-2">
                    {outboundTimes.length}{' '}
                    {outboundTimes.length === 1 ? 'train' : 'trains'} selected
                  </p>}
              </div> : <p className="text-sm text-gray-500">
                No schedule available for this route
              </p>}
          </div>

          {/* Return Trip */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightIcon className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">
                Return: {stationB} → {stationA}
              </h3>
            </div>

            {returnSchedule ? <div>
                <p className="text-sm text-gray-600 mb-3">
                  Select all trains you can take:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {returnSchedule.departureTimes.map(time => <label key={time} className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${returnTimes.includes(time) ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={returnTimes.includes(time)} onChange={() => handleReturnTimeToggle(time)} className="sr-only" />
                      <span className="font-medium">{time}</span>
                    </label>)}
                </div>
                {returnTimes.length > 0 && <p className="text-sm text-green-600 mt-2">
                    {returnTimes.length}{' '}
                    {returnTimes.length === 1 ? 'train' : 'trains'} selected
                  </p>}
              </div> : <p className="text-sm text-gray-500">
                No schedule available for this route
              </p>}
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700">
            Submit Round-Trip Interest
          </button>
        </form>
      </div>
    </div>;
}