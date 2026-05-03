import type { Timestamp } from "firebase/firestore";

export interface DeveloperGraphNode {
  uid: string;
  displayName?: string;
  skills: string[];
  interests: string[];
  recentProjects: string[];
  connections: string[];
  matchScore: Record<string, number>;
  lastGraphUpdate: Timestamp | Date;
}

export interface DeveloperMatch {
  uid: string;
  displayName: string;
  photoURL: string;
  skills: string[];
  city: string;
  score: number;
  reason?: string;
}
