import { Component, OnInit } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithRedirect
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  hasLoadedPage = false;
  isSigningIn = false;

  constructor(
    public auth: Auth,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    this.auth.onAuthStateChanged(async (user) => {
      this.hasLoadedPage = true;
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims['admin']) {
          this.router.navigateByUrl('/');
        } else {
          this.snackBar.open(
            `${user.email} is not authorized to access the next page.`
          );
          // delete the user if this is their first time signing in.
          // This means they've never signed in on the main community website.
          const { creationTime, lastSignInTime } = user.metadata;
          if (creationTime === lastSignInTime) await user.delete();
          await this.auth.signOut();
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
}
