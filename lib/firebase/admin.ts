import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getDatabase, type Database } from "firebase-admin/database";
import { getStorage } from "firebase-admin/storage";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let adminApp: App | null = null;

function ensureAdmin(): App {
  if (adminApp) return adminApp;
  const existing = getApps();
  if (existing.length) {
    adminApp = existing[0]!;
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    // Allow graceful degradation in preview environments: initialize without creds
    adminApp = initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "sahayak-local",
    });
    return adminApp;
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return adminApp;
}

export function adminAuth(): Auth {
  return getAuth(ensureAdmin());
}

export function adminDb(): Firestore {
  return getFirestore(ensureAdmin());
}

export function adminRtdb(): Database {
  return getDatabase(ensureAdmin());
}

export function adminStorage() {
  return getStorage(ensureAdmin());
}

export function adminMessaging(): Messaging {
  return getMessaging(ensureAdmin());
}
