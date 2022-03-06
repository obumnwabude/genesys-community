import {
  collection,
  doc,
  DocumentSnapshot,
  Firestore,
  getDoc,
  QueryDocumentSnapshot,
  SnapshotOptions
} from '@angular/fire/firestore';

export const constants = {
  LIGHT_MODE: 'light_mode',
  DARK_MODE: 'dark_mode',
  THEMES: ['light_mode', 'dark_mode'],
  DEFAULT_THEME: 'light_mode',
  LOCALSTORAGE_THEME_KEY: 'theme'
};

export const memberSnap = async (
  firestore: Firestore,
  memberId: string
): Promise<DocumentSnapshot<FirestoreMember>> => {
  return await getDoc(
    doc(
      collection(firestore, 'members').withConverter(FirestoreMember.converter),
      memberId
    )
  );
};

export interface AuthMember {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
}

export class AchievementData {
  constructor(
    public description: string,
    public link: string,
    public title: string,
    public time: Date,
    public type: string
  ) {}

  static fromJSON(json: any): AchievementData {
    return new AchievementData(
      json['description'],
      json['link'],
      json['title'],
      new Date(json['time']),
      json['type']
    );
  }

  static toJSON(achievement: AchievementData) {
    const { description, link, title, type } = achievement;
    return { description, link, title, type, time: achievement.time.getTime() };
  }
}

export class ProfileData {
  constructor(
    public department: string,
    public faculty: string,
    public level: string,
    public twitter: string
  ) {}

  static fromJSON(json: any): ProfileData {
    return new ProfileData(
      json['department'],
      json['faculty'],
      json['level'],
      json['twitter']
    );
  }

  static toJSON(profile: ProfileData) {
    const { department, faculty, level, twitter } = profile;
    return { department, faculty, level, twitter };
  }
}

export class ProgressData {
  constructor(
    public description: string,
    public skill: string,
    public time: Date
  ) {}

  static fromJSON(json: any): ProgressData {
    return new ProgressData(
      json['description'],
      json['skill'],
      new Date(json['time'])
    );
  }

  static toJSON(progress: ProgressData) {
    return {
      description: progress.description,
      skill: progress.skill,
      time: progress.time.getTime()
    };
  }
}

export class AuthActivity {
  constructor(public creationTime: Date, public lastSignInTime: Date) {}

  static fromJSON(json: any): AuthActivity {
    return new AuthActivity(
      new Date(json['creationTime']),
      new Date(json['lastSignInTime'])
    );
  }

  static toJSON(aa: AuthActivity) {
    return {
      creationTime: aa.creationTime.getTime(),
      lastSignInTime: aa.lastSignInTime.getTime()
    };
  }
}

export class FirestoreMember {
  constructor(
    public achievements: AchievementData[],
    public authActivity: AuthActivity,
    public profile: ProfileData,
    public progress: ProgressData[]
  ) {}

  static converter = {
    toFirestore(member: FirestoreMember) {
      return {
        achievements: member.achievements.map((a) => AchievementData.toJSON(a)),
        profile: ProfileData.toJSON(member.profile),
        progress: member.progress.map((p) => ProgressData.toJSON(p))
      };
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): FirestoreMember {
      const data = snapshot.data(options);
      const achievements = data['achievements']
        ? data['achievements'].map((a: any) => AchievementData.fromJSON(a))
        : [];
      const aa = data['authActivity']
        ? AuthActivity.fromJSON(data['authActivity'])
        : new AuthActivity(new Date(), new Date());
      const profile =
        data['profile'] && Object.keys(data['profile']).length > 0
          ? ProfileData.fromJSON(data['profile'])
          : new ProfileData('', '', '', '');
      const progress = data['progress']
        ? data['progress'].map((p: any) => ProgressData.fromJSON(p))
        : [];

      return new FirestoreMember(achievements, aa, profile, progress);
    }
  };
}
