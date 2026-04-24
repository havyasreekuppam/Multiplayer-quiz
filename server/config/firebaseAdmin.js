import admin from 'firebase-admin';

console.log("🔥 Firebase ENV CHECK:");
console.log("PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("PRIVATE_KEY EXISTS:", !!process.env.FIREBASE_PRIVATE_KEY);

const hasFirebaseAdminConfig =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY;

if (hasFirebaseAdminConfig && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export const ensureFirebaseAdmin = () => {
  if (!hasFirebaseAdminConfig || !admin.apps.length) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  return admin;
};

export const verifyFirebaseIdToken = async (idToken) => {
  const firebaseAdmin = ensureFirebaseAdmin();
  return firebaseAdmin.auth().verifyIdToken(idToken);
};

export default admin;
