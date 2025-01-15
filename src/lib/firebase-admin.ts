import * as admin from 'firebase-admin';

let firebaseAdmin: typeof admin;

if (process.env.NODE_ENV !== 'development') {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  firebaseAdmin = admin;
} else {
  // 개발 환경에서는 더미 객체 제공
  firebaseAdmin = admin;
}

export { firebaseAdmin as admin }; 