import admin from "firebase-admin";
import { env } from "./env";

if (!admin.apps.length) {
  if (env.firebase.projectId && env.firebase.privateKey && env.firebase.clientEmail) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        privateKey: env.firebase.privateKey,
        clientEmail: env.firebase.clientEmail,
      }),
    });
  } else {
    console.warn("[firebase] Credentials not set — Firebase auth will be unavailable.");
  }
}

export { admin };
