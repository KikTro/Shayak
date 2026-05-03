"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import { getFirebaseDb } from "@/lib/firebase/config";
import { subscribeToAuth } from "@/lib/firebase/auth";
import type { SahayakUser } from "@/types/user";

export interface UseAuthState {
  firebaseUser: User | null;
  profile: SahayakUser | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): UseAuthState {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SahayakUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setFirebaseUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const db = getFirebaseDb();
    const ref = doc(db, "users", firebaseUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProfile({ ...(snap.data() as SahayakUser), uid: firebaseUser.uid });
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [firebaseUser]);

  return {
    firebaseUser,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
  };
}
