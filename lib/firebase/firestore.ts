import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentData,
  type Query,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import type { SahayakUser } from "@/types/user";
import type { SahayakEvent } from "@/types/event";
import type { ChatRoom, ChatMessage } from "@/types/message";
import type { AgentAction, IntroRequest } from "@/types/agent";
import type { DeveloperGraphNode } from "@/types/developer";

/** Typed collection references. */
export const COLLECTIONS = {
  users: "users",
  events: "events",
  chats: "chats",
  agentActions: "agentActions",
  introRequests: "introRequests",
  developerGraph: "developerGraph",
} as const;

export function usersCol(): CollectionReference<SahayakUser> {
  return collection(getFirebaseDb(), COLLECTIONS.users) as CollectionReference<SahayakUser>;
}
export function eventsCol(): CollectionReference<SahayakEvent> {
  return collection(getFirebaseDb(), COLLECTIONS.events) as CollectionReference<SahayakEvent>;
}
export function chatsCol(): CollectionReference<ChatRoom> {
  return collection(getFirebaseDb(), COLLECTIONS.chats) as CollectionReference<ChatRoom>;
}
export function messagesCol(roomId: string): CollectionReference<ChatMessage> {
  return collection(getFirebaseDb(), COLLECTIONS.chats, roomId, "messages") as CollectionReference<ChatMessage>;
}
export function agentActionsCol(): CollectionReference<AgentAction> {
  return collection(getFirebaseDb(), COLLECTIONS.agentActions) as CollectionReference<AgentAction>;
}
export function introRequestsCol(): CollectionReference<IntroRequest> {
  return collection(getFirebaseDb(), COLLECTIONS.introRequests) as CollectionReference<IntroRequest>;
}
export function developerGraphCol(): CollectionReference<DeveloperGraphNode> {
  return collection(getFirebaseDb(), COLLECTIONS.developerGraph) as CollectionReference<DeveloperGraphNode>;
}

/** Generic helpers */
export async function getById<T>(col: CollectionReference<T>, id: string): Promise<T | null> {
  const snap = await getDoc(doc(col, id));
  return snap.exists() ? ({ ...(snap.data() as T), id } as T) : null;
}

export async function upsert<T extends DocumentData>(
  col: CollectionReference<T>,
  id: string,
  data: Partial<T>,
): Promise<void> {
  await setDoc(doc(col, id), { ...data, updatedAt: serverTimestamp() } as DocumentData, { merge: true });
}

export async function listQuery<T>(
  q: Query<T> | CollectionReference<T>,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const finalQuery = constraints.length ? query(q, ...constraints) : q;
  const snap = await getDocs(finalQuery);
  return snap.docs.map((d) => ({ ...(d.data() as T), id: d.id } as T));
}

export function subscribeQuery<T>(
  q: Query<T> | CollectionReference<T>,
  onNext: (items: T[]) => void,
  constraints: QueryConstraint[] = [],
): Unsubscribe {
  const finalQuery = constraints.length ? query(q, ...constraints) : q;
  return onSnapshot(finalQuery, (snap) => {
    const docs = snap.docs.map((d) => ({ ...(d.data() as T), id: d.id } as T));
    onNext(docs);
  });
}

/**
 * Find or create a DM room between two users.
 * Returns the room ID.
 */
export async function getOrCreateDMRoom(
  currentUid: string,
  otherUid: string,
  currentUser: { displayName: string; photoURL?: string },
  otherUser: { displayName: string; photoURL?: string },
): Promise<string> {
  const db = getFirebaseDb();
  const chats = chatsCol();

  // Look for existing DM room between these two users
  const q = query(
    chats,
    where("type", "==", "dm"),
    where("participants", "array-contains", currentUid),
  );
  const snap = await getDocs(q);

  for (const d of snap.docs) {
    const room = d.data() as ChatRoom;
    if (room.participants?.includes(otherUid)) {
      return d.id;
    }
  }

  // No existing room found, create a new one
  const newRoom: Omit<ChatRoom, "id"> = {
    name: `${currentUser.displayName} & ${otherUser.displayName}`,
    type: "dm",
    participants: [currentUid, otherUid],
    createdBy: currentUid,
    isPublic: false,
    createdAt: serverTimestamp() as unknown as Date,
  };

  const docRef = await addDoc(chats, newRoom);
  return docRef.id;
}

export { addDoc, doc, getDoc, orderBy, where, fsLimit as limit, serverTimestamp, setDoc, updateDoc, query };
