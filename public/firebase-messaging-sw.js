/* Sahayak — Firebase Cloud Messaging service worker */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

// Config is injected at build time via NEXT_PUBLIC_* values.
// Replace these placeholders with your real Firebase config when deploying,
// or use a build step to generate this file from environment variables.
firebase.initializeApp({
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Sahayak";
  const options = {
    body: payload.notification?.body,
    icon: "/favicon.ico",
    data: payload.data,
  };
  self.registration.showNotification(title, options);
});
