import {
  QueryDocumentSnapshot,
  SnapshotOptions
} from '@angular/fire/firestore';

import { Achievement } from './achievement';
import { AuthInfo } from './auth-info';
import { MemberStats } from './member-stats';
import { Profile } from './profile';
import { Progress } from './progress';

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
