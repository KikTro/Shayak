import { initializeApp } from "firebase-admin/app";

initializeApp();

export { scheduledScrape } from "./scheduledScrape";
export { onNewUser } from "./onNewUser";
export { onNewEvent } from "./onNewEvent";
export { fcmNotifier } from "./fcmNotifier";
