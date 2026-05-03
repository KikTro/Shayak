"use client";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorageClient } from "./config";

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const storage = getFirebaseStorageClient();
  const key = `profiles/${uid}/${Date.now()}-${sanitize(file.name)}`;
  const r = ref(storage, key);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}

export async function uploadChatAttachment(
  roomId: string,
  uid: string,
  file: File,
): Promise<string> {
  const storage = getFirebaseStorageClient();
  const key = `chats/${roomId}/${uid}/${Date.now()}-${sanitize(file.name)}`;
  const r = ref(storage, key);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}

function sanitize(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, "_").slice(0, 80);
}
