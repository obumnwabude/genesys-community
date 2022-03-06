import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthMember, FirestoreMember, memberSnap } from '@community/data';

@Component({
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
  isLoading = false;
  authMember: AuthMember | null = null;
  firestoreMember: FirestoreMember | null = null;

  constructor(
    private firestore: Firestore,
    private fns: Functions,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    const memberId = this.route.snapshot.paramMap.get('id');
    if (!memberId) this.router.navigateByUrl('/dashboard');
    else {
      try {
        this.authMember = (
          await httpsCallable(this.fns, 'getAuthMember')({ memberId })
        ).data as AuthMember;
        const snap = await memberSnap(this.firestore, memberId);
        if (!snap.exists()) {
          this.snackBar.open(`Member with uid: ${memberId} does not exist.`);
          this.router.navigateByUrl('/dashboard');
        } else {
          this.firestoreMember = snap.data();
        }
        this.isLoading = false;
      } catch (error: any) {
        if (error.code === 'unavailable') {
          this.snackBar
            .open(
              'Network Error. Please check internet connection.',
              'REFRESH PAGE'
            )
            .onAction()
            .subscribe(() => window.location.reload());
        } else {
          this.snackBar.open(error.message);
          this.router.navigateByUrl('/dashboard');
        }
      }
    }
  }

  capitalise(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }
}
