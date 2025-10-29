export type RouteDirection = 'A_to_B' | 'B_to_A';
export type GroupStatus = 'forming' | 'ready' | 'at_station' | 'on_train' | 'completed';
export type PaymentStatus = 'pending' | 'paid';
export interface User {
  id: string;
  name: string;
  phone: string;
  isSteward?: boolean;
}
export interface TripLeg {
  fromStation: string;
  toStation: string;
  acceptableTimes: string[]; // Array of train times user is willing to take
  selectedTime?: string; // Final agreed time for the group
}
export interface TripInterest {
  id: string;
  userId: string;
  date: string;
  outbound: TripLeg; // A to B
  return: TripLeg; // B to A
  createdAt: string;
}
export interface FareInspectorAlert {
  triggeredBy: string;
  triggeredByName: string;
  timestamp: string;
  acknowledged: string[]; // User IDs who have acknowledged
}
export interface Group {
  id: string;
  date: string;
  outbound: TripLeg; // A to B
  return: TripLeg; // B to A
  status: GroupStatus;
  members: GroupMember[];
  stewardId?: string;
  passPrice?: number;
  fareInspectorAlert?: FareInspectorAlert;
  createdAt: string;
}
export interface GroupMember {
  userId: string;
  userName: string;
  userPhone: string;
  confirmedAttendance: boolean;
  appearance?: string; // How they'll look at the station (e.g., "Red jacket, black backpack")
  paymentStatus: PaymentStatus;
  amountOwed?: number;
}
export interface TrainSchedule {
  fromStation: string;
  toStation: string;
  departureTimes: string[];
}