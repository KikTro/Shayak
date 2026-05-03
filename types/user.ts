import type { GeoPoint, Timestamp } from "firebase/firestore";

export type UserRole = "developer" | "organizer" | "admin";

export interface UserLocation {
  city: string;
  state: string;
  country: string;
  coordinates: GeoPoint | { latitude: number; longitude: number };
  geohash?: string;
}

export interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface SahayakUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  location: UserLocation;
  skills: string[];
  interests?: string[];
  socialLinks: SocialLinks;
  role: UserRole;
  joinedAt: Timestamp | Date;
  lastActiveAt: Timestamp | Date;
  agentDiscovered: boolean;
  agentSource: "github" | "twitter" | "gdg" | "manual" | string;
  notificationTokens: string[];
}

export type PublicUser = Pick<
  SahayakUser,
  | "uid"
  | "displayName"
  | "photoURL"
  | "bio"
  | "location"
  | "skills"
  | "socialLinks"
  | "role"
  | "agentDiscovered"
  | "agentSource"
>;
