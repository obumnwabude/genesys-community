import { Timestamp } from '@angular/fire/firestore';

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
