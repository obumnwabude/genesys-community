import { Timestamp } from '@angular/fire/firestore';

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
