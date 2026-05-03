"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./config";
import type { SahayakUser } from "@/types/user";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  await bootstrapUserDoc(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email, password);
  await bootstrapUserDoc(result.user);
  return result.user;
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
  city?: string;
  skills?: string[];
  github?: string;
  twitter?: string;
}

export async function registerWithEmail(input: RegisterInput): Promise<User> {
  const auth = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(result.user, { displayName: input.displayName });
  await bootstrapUserDoc(result.user, {
    displayName: input.displayName,
    skills: input.skills ?? [],
    socialLinks: {
      github: input.github,
      twitter: input.twitter,
    },
    city: input.city,
  });
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function subscribeToAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), cb);
}

async function bootstrapUserDoc(
  user: User,
  extra?: {
    displayName?: string;
    skills?: string[];
    socialLinks?: { github?: string; twitter?: string };
    city?: string;
  },
): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const base: Partial<SahayakUser> = {
    uid: user.uid,
    displayName: extra?.displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "Builder",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    bio: "",
    skills: extra?.skills ?? [],
    socialLinks: extra?.socialLinks ?? {},
    role: "developer",
    agentDiscovered: false,
    agentSource: "manual",
    notificationTokens: [],
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...base,
      location: {
        city: extra?.city ?? "",
        state: "",
        country: "",
        coordinates: { latitude: 0, longitude: 0 },
      },
      joinedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      ref,
      { lastActiveAt: serverTimestamp(), email: base.email, photoURL: base.photoURL },
      { merge: true },
    );
  }
}
