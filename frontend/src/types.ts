import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export interface Reservation {
  guest: string;
  dateTime: string;
  partySize: string;
}

export interface BookedReservation {
  confirmation_code: string;
  guest_name: string;
  date_str: string;
  time_str: string;
  party_size: number;
  special_requests: string;
  created_at: string;
}

export interface RoomBooking {
  confirmation_code: string;
  guest_name: string;
  room_id: string;
  room_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  price_per_night: number;
  special_requests: string;
  created_at: string;
}

export interface TranscriptEntry {
  id?: string;
  speaker: 'Parveen' | 'You' | 'System';
  text: string;
  final?: boolean;
  timestamp: Date;
}
