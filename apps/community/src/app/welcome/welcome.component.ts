import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  Auth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect
} from '@angular/fire/auth';
import { doc, Firestore, setDoc, Timestamp } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { memberSnap, ProfileData } from '@community/data';

@Component({
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  hasLoadedPage = false;
  isNewMember = false;
  isSigningIn = false;
  profileData = new ProfileData('', '', '', '');
  @ViewChild('profileForm') profileForm!: NgForm;

  constructor(
    public auth: Auth,
    private changeDetector: ChangeDetectorRef,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const redirectResult = await getRedirectResult(this.auth);
      if (redirectResult && redirectResult.user) {
        this.isSigningIn = true;
        const { creationTime, lastSignInTime } = redirectResult.user.metadata;
        // save on very first sign in since the cloud function will do so
        // and it might not yet have run (to create the firestore object)
        // by the time this code runs for the first time on a given user.
        if (creationTime && lastSignInTime && creationTime !== lastSignInTime) {
          await setDoc(
            doc(this.firestore, 'members', redirectResult.user.uid),
            {
              authInfo: {
                // save only lastSignInTime (which is now), as creationTime
                // won't change again.
                lastSignInTime: Timestamp.fromDate(new Date(lastSignInTime))
              }
            },
            { merge: true }
          );
        }
      }
    } catch (_) {
      /* ignore error */
    }
    this.auth.onAuthStateChanged(async (member) => {
      this.hasLoadedPage = true;
      if (!member) {
        this.isSigningIn = false;
        this.changeDetector.detectChanges();
      } else {
        try {
          const snap = await memberSnap(this.firestore, member.uid);
          if (!snap.exists()) {
            this.isNewMember = true;
          } else {
            const { department, faculty, level, twitter } = snap.data().profile;
            this.isNewMember =
              department === '' &&
              faculty === '' &&
              level === '' &&
              twitter === '';
          }
          if (!this.isNewMember) {
            let nextRoute = this.route.snapshot.queryParams['next'];
            if (!nextRoute) nextRoute = '/';
            this.router.navigate([nextRoute]);
          }
        } catch (error: any) {
          if (error.code === 'unavailable') {
            this.hasLoadedPage = false;
            this.snackBar
              .open(
                'Network Error. Please check internet connection.',
                'REFRESH PAGE'
              )
              .onAction()
              .subscribe(() => window.location.reload());
          }
        }
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    if (!this.isSigningIn) {
      try {
        this.isSigningIn = true;
        await signInWithRedirect(this.auth, new GoogleAuthProvider());
      } catch (error: any) {
        this.snackBar.open(error.message);
        this.isSigningIn = false;
      }
    }
  }

  async saveProfile(): Promise<void> {
    if (this.auth.currentUser) {
      if (this.profileForm.valid) {
        try {
          this.ngxLoader.start();
          await setDoc(
            doc(this.firestore, 'members', this.auth.currentUser.uid),
            { profile: ProfileData.toJSON(this.profileData) },
            { merge: true }
          );
          let nextRoute = this.route.snapshot.queryParams['next'];
          // record member's progress on completing first sign in
          if (!nextRoute || nextRoute === '/') nextRoute = '/progress';
          this.router.navigate([nextRoute]);
        } catch (error: any) {
          this.snackBar.open(error.message);
        } finally {
          this.ngxLoader.stop();
        }
      } else {
        this.snackBar.open('Please resolve all errors first.');
      }
    } else {
      this.snackBar.open('Please Sign In first.');
    }
  }
}
