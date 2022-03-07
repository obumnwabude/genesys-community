export * from './lib/constants';
export * from './lib/types/index';

import {
  collection,
  doc,
  DocumentSnapshot,
  Firestore,
  getDoc
} from '@angular/fire/firestore';

import { Member } from './lib/types/member';

export const memberSnap = async (
  firestore: Firestore,
  memberId: string
): Promise<DocumentSnapshot<Member>> => {
  return await getDoc(
    doc(
      collection(firestore, 'members').withConverter(Member.converter),
      memberId
    )
  );
};
