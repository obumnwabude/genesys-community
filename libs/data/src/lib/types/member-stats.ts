export class MemberStats {
  constructor(public achievements: number, public progress: number) {}

  static fromJSON(json: any): MemberStats {
    return new MemberStats(json['achievements'], json['progress']);
  }

  static toJSON(stats: MemberStats) {
    return { achievements: stats.achievements, progress: stats.progress };
  }
}
