// ── Enums ────────────────────────────────────────────
export enum ViewState {
  EXPLORE = 'EXPLORE',
  MY_TICKETS = 'MY_TICKETS',
  ADMIN = 'ADMIN',
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
  created_at?: string;
  name?: string;
  email?: string;
}
