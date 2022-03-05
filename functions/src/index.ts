import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
const db = admin.firestore();

exports.createFirestoreUser = functions.auth
  .user()
  .onCreate(async (authUser) => {
    await db
      .doc('/users/counter')
      .set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true })
      .catch((error) => console.log(error));

    await db
      .doc(`/users/${authUser.uid}`)
      .set({}, { merge: true })
      .catch((error) => console.log(error));
  });
  
exports.deleteFirestoreUser = functions.auth
  .user()
  .onDelete(async (authUser) => {
    await db
      .doc('/users/counter')
      .set({ count: admin.firestore.FieldValue.increment(-1) }, { merge: true })
      .catch((error) => console.log(error));

    await db
      .doc(`/users/${authUser.uid}`)
      .delete()
      .catch((error) => console.log(error));
  });

