// Database types for Supabase queries
// These types represent the structure of database queries with nested relationships

export interface Profile {
  id: string;
  display_name: string;
  email: string | null;
  phone: string;
  profile_photo_url: string | null;
  fcm_token: string | null;
  reputation_score: number;
  trips_completed: number;
  on_time_payment_rate: number;
  is_community_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Train {
  id: string;
  departure_time: string;
  origin: string;
  destination: string;
  direction: 'outbound' | 'inbound';
  days_of_week: number[];
  created_at: string;
}

export interface Trip {
  id: string;
  train_id: string;
  date: string;
  status: 'scheduled' | 'delayed' | 'cancelled';
  delay_minutes: number | null;
  created_at: string;
  updated_at: string;
  train?: Train;
}

export interface Group {
  id: string;
  trip_id: string;
  group_number: number;
  steward_id: string | null;
  pass_screenshot_url: string | null;
  pass_ticket_number: string | null;
  pass_ticket_number_hash: string | null;
  pass_activated_at: string | null;
  cost_per_person: number;
  created_at: string;
  updated_at: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  coach_number: string | null;
  coach_level: 'upper' | 'lower' | 'middle' | null;
  checked_in_at: string | null;
  payment_marked_sent_at: string | null;
  payment_reminder_sent_at: string | null;
  joined_at: string;
  user?: Profile;
}

export interface FareInspectionAlert {
  id: string;
  group_id: string;
  triggered_by_user_id: string;
  triggered_at: string;
}

export interface AlertAcknowledgment {
  id: string;
  alert_id: string;
  user_id: string;
  acknowledged_at: string;
}

// Nested query result types
export interface GroupWithMemberships extends Group {
  memberships: GroupMembership[];
}

export interface TripWithDetails extends Trip {
  train: Train;
  groups: GroupWithMemberships[];
}

// Supabase cookie options type
export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
}
