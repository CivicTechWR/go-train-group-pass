import { TrainSchedule } from '../types';

// Sample train schedules - in real app, would come from Metrolinx API
export const trainSchedules: TrainSchedule[] = [{
  fromStation: 'Union Station',
  toStation: 'Oakville GO',
  departureTimes: ['06:15', '06:45', '07:15', '07:45', '08:15', '08:45', '09:15', '09:45']
}, {
  fromStation: 'Oakville GO',
  toStation: 'Union Station',
  departureTimes: ['16:15', '16:45', '17:15', '17:45', '18:15', '18:45', '19:15', '19:45']
}, {
  fromStation: 'Union Station',
  toStation: 'Burlington GO',
  departureTimes: ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30']
}, {
  fromStation: 'Burlington GO',
  toStation: 'Union Station',
  departureTimes: ['16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30']
}, {
  fromStation: 'Union Station',
  toStation: 'Port Credit GO',
  departureTimes: ['06:20', '06:50', '07:20', '07:50', '08:20', '08:50', '09:20']
}, {
  fromStation: 'Port Credit GO',
  toStation: 'Union Station',
  departureTimes: ['16:20', '16:50', '17:20', '17:50', '18:20', '18:50', '19:20']
}];
export function getSchedule(fromStation: string, toStation: string): TrainSchedule | undefined {
  return trainSchedules.find(s => s.fromStation === fromStation && s.toStation === toStation);
}