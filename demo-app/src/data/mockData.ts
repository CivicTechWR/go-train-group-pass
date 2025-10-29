import { User, Group } from '../types';
export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Chen',
  phone: '416-555-0123',
  isSteward: false
};
export const mockUsers: User[] = [currentUser, {
  id: 'user-2',
  name: 'Sarah Johnson',
  phone: '416-555-0124',
  isSteward: true
}, {
  id: 'user-3',
  name: 'Mike Peters',
  phone: '416-555-0125'
}, {
  id: 'user-4',
  name: 'Emma Wilson',
  phone: '416-555-0126'
}, {
  id: 'user-5',
  name: 'James Lee',
  phone: '416-555-0127'
}];
export const mockGroups: Group[] = [{
  id: 'group-1',
  date: '2024-01-15',
  outbound: {
    fromStation: 'Union Station',
    toStation: 'Oakville GO',
    acceptableTimes: ['08:15', '08:45'],
    selectedTime: '08:15'
  },
  return: {
    fromStation: 'Oakville GO',
    toStation: 'Union Station',
    acceptableTimes: ['17:45', '18:15'],
    selectedTime: '17:45'
  },
  status: 'on_train',
  members: [{
    userId: 'user-1',
    userName: 'Alex Chen',
    userPhone: '416-555-0123',
    confirmedAttendance: true,
    appearance: 'Navy blue jacket, grey backpack',
    paymentStatus: 'paid',
    amountOwed: 12
  }, {
    userId: 'user-3',
    userName: 'Mike Peters',
    userPhone: '416-555-0125',
    confirmedAttendance: true,
    appearance: 'Black coat, red scarf',
    paymentStatus: 'paid',
    amountOwed: 12
  }, {
    userId: 'user-4',
    userName: 'Emma Wilson',
    userPhone: '416-555-0126',
    confirmedAttendance: true,
    appearance: 'Green parka, rolling suitcase',
    paymentStatus: 'paid',
    amountOwed: 12
  }],
  stewardId: 'user-3',
  passPrice: 36,
  createdAt: '2024-01-14T10:00:00Z'
}, {
  id: 'group-2',
  date: '2024-01-15',
  outbound: {
    fromStation: 'Union Station',
    toStation: 'Burlington GO',
    acceptableTimes: ['07:00', '07:30'],
    selectedTime: '07:30'
  },
  return: {
    fromStation: 'Burlington GO',
    toStation: 'Union Station',
    acceptableTimes: ['18:00', '18:30', '19:00'],
    selectedTime: '18:30'
  },
  status: 'ready',
  members: [{
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userPhone: '416-555-0124',
    confirmedAttendance: true,
    appearance: 'Brown leather jacket, blue jeans',
    paymentStatus: 'pending'
  }, {
    userId: 'user-5',
    userName: 'James Lee',
    userPhone: '416-555-0127',
    confirmedAttendance: true,
    appearance: 'Grey hoodie, black messenger bag',
    paymentStatus: 'pending'
  }],
  stewardId: 'user-2',
  createdAt: '2024-01-14T11:00:00Z'
}];