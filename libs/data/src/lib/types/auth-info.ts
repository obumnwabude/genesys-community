import { Timestamp } from '@angular/fire/firestore';

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
