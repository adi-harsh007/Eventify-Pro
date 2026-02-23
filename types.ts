export enum ViewState {
  EXPLORE = 'EXPLORE',
  TICKETS = 'TICKETS',
  ADMIN = 'ADMIN',
  MEGA_EVENT = 'MEGA_EVENT',
}

// ── Interfaces ───────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  google_id?: string;
  isAdmin?: boolean;
  created_at?: string;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered_count: number;
  category: 'Hackathon' | 'Tech Competition' | 'Sports Event' | 'Cultural Fest' | 'Music Concert' | 'Workshop' | 'Conference' | 'Meetup' | 'Webinar' | 'Social' | 'Other';
  department: 'CSE' | 'ECE' | 'Mechanical' | 'Arts' | 'Sports' | 'Management' | 'Science' | 'General';
  image_url?: string;
  is_team_event?: boolean;
  max_team_size?: number;
  organizer_id: number;
  created_at?: string;
  updated_at?: string;
  // Admin join fields
  creator_name?: string;
  creator_email?: string;
}

export interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  team_name?: string;
  created_at?: string;
  name?: string;
  email?: string;
}
