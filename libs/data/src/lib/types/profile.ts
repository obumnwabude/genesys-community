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
