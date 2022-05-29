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
import { memberSnap, Profile } from '@community/data';

@Component({
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  faculties = Profile.FACULTIES;
  genders = Profile.GENDERS;
  hasLoadedPage = false;
  isNewMember = false;
  isSigningIn = false;
  levels = Profile.LEVELS;
  profile = new Profile(
    '',
    this.faculties[0],
    this.genders[0],
    this.levels[0],
    ''
  );
  @ViewChild('profileForm') profileForm!: NgForm;

  constructor(
    public auth: Auth,
    private changeDetector: ChangeDetectorRef,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  navigateOut(): void {
    let nextRoute = this.route.snapshot.queryParams['next'];
    if (!nextRoute) nextRoute = '/';
    this.router.navigate([nextRoute]);
  }

  async ngOnInit(): Promise<void> {
    try {
      const redirectResult = await getRedirectResult(this.auth);
      if (redirectResult && redirectResult.user) {
        this.isSigningIn = true;
        const { creationTime, lastSignInTime } = redirectResult.user.metadata;
        // Save lastSignInTime at all new signIns except the very first signIn.
        // Avoided the first signIn because cloud functions will save the
        // signInTime as it creates the firestore member document.
        //
        // It was also worth avoiding the save at first signInn because the
        // cloud function might not yet have run (to create the firestore
        // member document), and hence could an error could be thrown.
        if (creationTime && lastSignInTime && creationTime !== lastSignInTime) {
          await setDoc(
            doc(this.firestore, 'members', redirectResult.user.uid),
            {
              authInfo: {
                // save only lastSignInTime as creationTime won't change again.
                lastSignInTime: Timestamp.fromDate(new Date(lastSignInTime))
              }
            },
            { merge: true }
          );
        }
      }
    } catch (_) {
      // Ignore checking redirect errors since getRedirectResult() may not
      // always return a valid RedirectResult or could return null.
      //
      // In other words, member fit just dey reload page, no be say him be
      // just dey land back from signInWithGoogle. Shaa, the koko be say error
      // from this place no just matter. Na ESLint talk say catch block no
      // suppose dey empty. Say I must put comment if I wan ignore error.
    }

    this.auth.onAuthStateChanged(async (member) => {
      this.hasLoadedPage = true;
      if (!member) {
        this.isSigningIn = false;
        this.changeDetector.detectChanges();
      } else if (member.phoneNumber) {
        try {
          const snap = await memberSnap(this.firestore, member.uid);
          if (!snap.exists()) {
            this.isNewMember = true;
          } else {
            const { department, faculty, gender, level, twitter } =
              snap.data().profile;
            this.isNewMember =
              [department, gender, faculty, level, twitter].filter(
                (i) => i === ''
              ).length === 5;
          }
          if (!this.isNewMember) this.navigateOut();
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
            { profile: Profile.toJSON(this.profile) },
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
