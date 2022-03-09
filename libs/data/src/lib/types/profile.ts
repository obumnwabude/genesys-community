export class Profile {
  constructor(
    public department: string,
    public faculty: string,
    public level: string,
    public twitter: string
  ) {}

  static FACULTIES = [
    'Agriculture',
    'Basic Medical Sciences',
    'Biological Sciences',
    'College of Medicine',
    'Education',
    'Engineering and Technology',
    'Humanities',
    'Law',
    'Management Sciences',
    'Physical Sciences',
    'Science',
    'Social Sciences',
    'Not Applicable'
  ];

  static LEVELS = ['100', '200', '300', '400', '500', '600', 'Not Applicable'];

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
