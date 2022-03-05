import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    if (!this.auth.currentUser) {
      return this.router.parseUrl('/welcome');
    } else {
      try {
        const firestoreMember = await getDoc(
          doc(this.firestore, 'members', this.auth.currentUser.uid)
        );
        const isNewMember =
          !firestoreMember.exists() ||
          (firestoreMember.exists() && !firestoreMember.data()['profile']);
        return isNewMember ? this.router.parseUrl('/welcome') : true;
      } catch (_) {
        return this.router.parseUrl('/welcome');
      }
    }
  }
}
