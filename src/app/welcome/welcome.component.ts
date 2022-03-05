import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  Auth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect
} from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';

class ProfileData {
  constructor(
    public department: string,
    public faculty: string,
    public level: string,
    public twitter: string
  ) {}

  toJSON() {
    const { department, faculty, level, twitter } = this;
    return { department, faculty, level, twitter };
  }
}

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
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const redirectResult = await getRedirectResult(this.auth);
      if (redirectResult && redirectResult.user) this.isSigningIn = true;
    } catch (_) {}
    this.auth.onAuthStateChanged(async (member) => {
      if (!member) {
        this.isSigningIn = false;
        this.hasLoadedPage = true;
        this.changeDetector.detectChanges();
      } else {
        this.hasLoadedPage = true;
        try {
          const fU = await getDoc(doc(this.firestore, 'members', member.uid));
          this.isNewMember =
            !fU.exists() || (fU.exists() && !fU.data()['profile']);
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
            { profile: this.profileData.toJSON() },
            { merge: true }
          );
          this.isNewMember = false;
        } catch (error: any) {
          this.snackBar.open(error.message);
        } finally {
          this.ngxLoader.stop();
        }
      } else {
        this.snackBar.open('Please resolve all errors first.');
      }
    } else {
      this.snackBar.open('You should not be here. Sign In first.');
    }
  }
}
