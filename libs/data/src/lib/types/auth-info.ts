import { Timestamp } from '@angular/fire/firestore';

export class AuthInfo {
  constructor(
    public creationTime: Date,
    public displayName: string,
    public email: string,
    public lastSignInTime: Date,
    public phoneNumber: string,
    public photoURL: string,
    public uid: string
  ) {}

  static fromJSON(json: any): AuthInfo {
    return new AuthInfo(
      json['creationTime'].toDate(),
      json['displayName'],
      json['email'],
      json['lastSignInTime'].toDate(),
      json['phoneNumber'],
      json['photoURL'],
      json['uid']
    );
  }

  static toJSON(authInfo: AuthInfo) {
    const { displayName, email, phoneNumber, photoURL, uid } = authInfo;
    return {
      creationTime: Timestamp.fromDate(authInfo.creationTime),
      displayName,
      email,
      lastSignInTime: Timestamp.fromDate(authInfo.lastSignInTime),
      phoneNumber,
      photoURL,
      uid
    };
  }
}
