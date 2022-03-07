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
  DARK_MODE: 'dark_mode',
  DEFAULT_PAGE_SIZE: 50,
  DEFAULT_THEME: 'light_mode',
  LIGHT_MODE: 'light_mode',
  LOCALSTORAGE_THEME_KEY: 'theme',
  THEMES: ['light_mode', 'dark_mode']
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

export class Achievement {
  constructor(
    public description: string,
    public link: string,
    public title: string,
    public time: Date,
    public type: string
  ) {}

  static fromJSON(json: any): Achievement {
    return new Achievement(
      json['description'],
      json['link'],
      json['title'],
      json['time'].toDate(),
      json['type']
    );
  }

  static toJSON(achievement: Achievement) {
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

export class Profile {
  constructor(
    public department: string,
    public faculty: string,
    public level: string,
    public twitter: string
  ) {}

  static fromJSON(json: any): Profile {
    return new Profile(
      json['department'],
      json['faculty'],
      json['level'],
      json['twitter']
    );
  }

  static toJSON(profile: Profile) {
    const { department, faculty, level, twitter } = profile;
    return { department, faculty, level, twitter };
  }
}

export class Progress {
  constructor(
    public description: string,
    public skill: string,
    public time: Date
  ) {}

  static fromJSON(json: any): Progress {
    return new Progress(
      json['description'],
      json['skill'],
      json['time'].toDate()
    );
  }

  static toJSON(progress: Progress) {
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

export class MemberStats {
  constructor(public achievements: number, public progress: number) {}

  static fromJSON(json: any): MemberStats {
    return new MemberStats(json['achievements'], json['progress']);
  }

  static toJSON(stats: MemberStats) {
    return { achievements: stats.achievements, progress: stats.progress };
  }
}

export class Member {
  constructor(
    public achievements: Achievement[],
    public authInfo: AuthInfo,
    public profile: Profile,
    public progress: Progress[],
    public stats: MemberStats
  ) {}

  static converter = {
    toFirestore(member: Member) {
      return {
        achievements: member.achievements.map((a) => Achievement.toJSON(a)),
        authInfo: AuthInfo.toJSON(member.authInfo),
        profile: Profile.toJSON(member.profile),
        progress: member.progress.map((p) => Progress.toJSON(p)),
        stats: MemberStats.toJSON(member.stats)
      };
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): Member {
      const data = snapshot.data(options);
      const achievements = data['achievements']
        ? data['achievements'].map((a: any) => Achievement.fromJSON(a))
        : [];
      // had to access AuthInfo directly because its data comes solely from auth
      const authInfo = AuthInfo.fromJSON(data['authInfo']);
      const profile =
        data['profile'] && Object.keys(data['profile']).length > 0
          ? Profile.fromJSON(data['profile'])
          : new Profile('', '', '', '');
      const progress = data['progress']
        ? data['progress'].map((p: any) => Progress.fromJSON(p))
        : [];
      const stats = data['stats']
        ? MemberStats.fromJSON(data['stats'])
        : new MemberStats(achievements.length, progress.length);

      return new Member(achievements, authInfo, profile, progress, stats);
    }
  };
}
