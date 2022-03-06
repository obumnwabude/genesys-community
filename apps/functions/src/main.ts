import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();

exports.createFirestoreMember = functions.auth
  .user()
  .onCreate(async (authMember) => {
    await db
      .doc('/members/counter')
      .set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true })
      .catch((error) => console.log(error));

    const { creationTime, lastSignInTime } = authMember.metadata;
    const { Timestamp } = admin.firestore;
    await db
      .doc(`/members/${authMember.uid}`)
      .set(
        {
          achievements: [],
          authActivity: {
            creationTime: Timestamp.fromDate(new Date(+creationTime)),
            lastSignInTime: Timestamp.fromDate(new Date(+lastSignInTime))
          },
          profile: {},
          progress: []
        },
        { merge: true }
      )
      .catch((error) => console.log(error));
  });

exports.deleteFirestoreMember = functions.auth
  .user()
  .onDelete(async (authMember) => {
    await db
      .doc('/members/counter')
      .set({ count: admin.firestore.FieldValue.increment(-1) }, { merge: true })
      .catch((error) => console.log(error));

    await db
      .doc(`/members/${authMember.uid}`)
      .delete()
      .catch((error) => console.log(error));
  });

exports.getAuthMember = functions.https.onCall(async (data, context) => {
  if (!data.memberId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Provide memberId'
    );
  }
  const unauthenticated = new functions.https.HttpsError(
    'unauthenticated',
    'You are not authorized to access this resource.'
  );
  if (!context.auth) throw unauthenticated;
  else {
    const claims = (await admin.auth().getUser(context.auth.uid)).customClaims;
    if (claims && !claims['admin']) throw unauthenticated;
    else {
      try {
        const user = await admin.auth().getUser(data.memberId);
        const { uid, email, displayName, phoneNumber } = user;
        return { uid, email, displayName, phoneNumber };
      } catch (error: any) {
        throw new functions.https.HttpsError('unknown', error);
      }
    }
  }
});

exports.getAuthMembers = functions.https.onCall(async (_, context) => {
  const unauthenticated = new functions.https.HttpsError(
    'unauthenticated',
    'You are not authorized to access this resource.'
  );
  if (!context.auth) throw unauthenticated;
  else {
    const claims = (await admin.auth().getUser(context.auth.uid)).customClaims;
    if (claims && !claims['admin']) throw unauthenticated;
    else {
      const users = await admin.auth().listUsers();
      return users.users.map((u) => {
        const { uid, email, displayName, photoURL, phoneNumber } = u;
        return { uid, email, displayName, photoURL, phoneNumber };
      });
    }
  }
});
