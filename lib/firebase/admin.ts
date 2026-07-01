import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function app() {
  if (getApps().length) return getApps()[0];
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return initializeApp({ credential: applicationDefault() });
  throw new Error("Firestore is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
}

export function adminDb() {
  return getFirestore(app());
}

