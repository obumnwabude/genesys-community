import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
admin.initializeApp();
const db = admin.firestore();

exports.createMember = functions.auth.user().onCreate(async (member) => {
  await db
    .doc('/members/counter')
    .set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true })
    .catch((error) => console.log(error));

  const { creationTime, lastSignInTime } = member.metadata;
  const { Timestamp } = admin.firestore;
  const { displayName, email, phoneNumber, photoURL, uid } = member;
  await db
    .doc(`/members/${member.uid}`)
    .set(
      {
        achievements: [],
        authInfo: {
          creationTime: Timestamp.fromDate(new Date(creationTime)),
          displayName,
          email,
          lastSignInTime: Timestamp.fromDate(new Date(lastSignInTime)),
          phoneNumber,
          photoURL,
          uid
        },
        profile: {},
        progress: [],
        stats: {
          achievements: 0,
          progress: 0
        }
      },
      { merge: true }
    )
    .catch((error) => console.log(error));
});

exports.deleteMember = functions.auth.user().onDelete(async (member) => {
  await db
    .doc('/members/counter')
    .set({ count: admin.firestore.FieldValue.increment(-1) }, { merge: true })
    .catch((error) => console.log(error));

  await db
    .doc(`/members/${member.uid}`)
    .delete()
    .catch((error) => console.log(error));
});
