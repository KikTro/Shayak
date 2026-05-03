import type { GeoPoint, Timestamp } from "firebase/firestore";

export type EventSource = "gdg" | "user_created" | "agent_generated";

export interface EventOrganizer {
  uid: string;
  name: string;
  photoURL?: string;
}

export interface EventLocation {
  venueName: string;
  address: string;
  city: string;
  coordinates: GeoPoint | { latitude: number; longitude: number };
  geohash?: string;
}

export interface SahayakEvent {
  id: string;
  title: string;
  description: string;
  source: EventSource;
  sourceUrl?: string;
  organizer: EventOrganizer;
  coHosts: string[];
  location: EventLocation;
  startTime: Timestamp | Date | string;
  endTime: Timestamp | Date | string;
  tags: string[];
  coverImageURL?: string;
  attendees: string[];
  maxAttendees?: number;
  requiresApproval: boolean;
  pendingApprovals: string[];
  chatRoomId: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  gdgChapter?: string;
  agentShoutoutGenerated: boolean;
}

export interface NearbyEvent extends SahayakEvent {
  distanceKm: number;
  travelTime?: string;
}
