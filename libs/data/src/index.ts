import {
  collection,
  doc,
  DocumentSnapshot,
  Firestore,
  getDoc,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp
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
): Promise<DocumentSnapshot<Member>> => {
  return await getDoc(
    doc(
      collection(firestore, 'members').withConverter(Member.converter),
      memberId
    )
  );
};

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
      json['time'].toDate(),
      json['type']
    );
  }

  static toJSON(achievement: AchievementData) {
    const { description, link, title, type } = achievement;
    return {
      description,
      link,
      title,
      type,
      time: Timestamp.fromDate(achievement.time)
    };
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
      json['time'].toDate()
    );
  }

  static toJSON(progress: ProgressData) {
    return {
      description: progress.description,
      skill: progress.skill,
      time: Timestamp.fromDate(progress.time)
    };
  }
}

export class AuthInfo {
  constructor(
    public creationTime: Date,
    public displayName: string,
    public email: string,
    public lastSignInTime: Date,
    public phoneNumber: string,
    public uid: string
  ) {}

  static fromJSON(json: any): AuthInfo {
    return new AuthInfo(
      json['creationTime'].toDate(),
      json['displayName'],
      json['email'],
      json['lastSignInTime'].toDate(),
      json['phoneNumber'],
      json['uid']
    );
  }

  static toJSON(authInfo: AuthInfo) {
    const { displayName, email, phoneNumber, uid } = authInfo;
    return {
      creationTime: Timestamp.fromDate(authInfo.creationTime),
      displayName,
      email,
      lastSignInTime: Timestamp.fromDate(authInfo.lastSignInTime),
      phoneNumber,
      uid
    };
  }
}

export class Member {
  constructor(
    public achievements: AchievementData[],
    public authInfo: AuthInfo,
    public profile: ProfileData,
    public progress: ProgressData[]
  ) {}

  static converter = {
    toFirestore(member: Member) {
      return {
        achievements: member.achievements.map((a) => AchievementData.toJSON(a)),
        authInfo: AuthInfo.toJSON(member.authInfo),
        profile: ProfileData.toJSON(member.profile),
        progress: member.progress.map((p) => ProgressData.toJSON(p))
      };
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): Member {
      const data = snapshot.data(options);
      const achievements = data['achievements']
        ? data['achievements'].map((a: any) => AchievementData.fromJSON(a))
        : [];
      // had to access AuthInfo directly because its data comes solely from auth
      const authInfo = AuthInfo.fromJSON(data['authInfo']);
      const profile =
        data['profile'] && Object.keys(data['profile']).length > 0
          ? ProfileData.fromJSON(data['profile'])
          : new ProfileData('', '', '', '');
      const progress = data['progress']
        ? data['progress'].map((p: any) => ProgressData.fromJSON(p))
        : [];

      return new Member(achievements, authInfo, profile, progress);
    }
  };
}
