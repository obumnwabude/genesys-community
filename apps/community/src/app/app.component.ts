import { Component, HostBinding, OnInit } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { constants, memberSnap } from '@community/data';
import { SPINNER } from 'ngx-ui-loader';

import { ThemingService } from './theming.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  SPINNER = SPINNER;
  isSigningIn = false;
  // the 500 level of orange palette in Material design
  primaryColor = '#ff9800';
  themes = constants.THEMES;
  year = new Date().getFullYear();
  @HostBinding('class') public cssClass!: string;

  constructor(
    public auth: Auth,
    private overlayContainer: OverlayContainer,
    private firestore: Firestore,
    public themingService: ThemingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.themingService.theme.subscribe((theme: string) => {
      this.cssClass = theme;
      const oCClasses = this.overlayContainer.getContainerElement().classList;
      oCClasses.remove(...Array.from(this.themes));
      oCClasses.add(this.cssClass);
    });
    this.auth.onAuthStateChanged(async (authMember) => {
      if (!authMember) {
        if (!this.router.url.includes('welcome')) {
          this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
        }
      } else {
        try {
          const snap = await memberSnap(this.firestore, authMember.uid);
          let isNewMember: boolean;
          if (!snap.exists()) {
            isNewMember = true;
          } else {
            const phoneInAuth = authMember.phoneNumber;
            if (!phoneInAuth) {
              isNewMember = true;
            } else {
              const firestoreMember = snap.data();
              const phoneNumber = authMember.phoneNumber;
              const phoneInFirestore = firestoreMember.authInfo.phoneNumber;
              if (!phoneInFirestore || phoneInFirestore !== phoneInAuth) {
                await setDoc(
                  doc(this.firestore, 'members', authMember.uid),
                  { authInfo: { phoneNumber } },
                  { merge: true }
                );
              }
              const { department, faculty, level, twitter } =
                firestoreMember.profile;
              isNewMember =
                [department, faculty, level, twitter].filter((i) => i === '')
                  .length === 4;
            }
          }
          if (isNewMember) {
            if (!this.router.url.includes('welcome')) {
              this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
            }
          }
        } catch (_) {
          if (!this.router.url.includes('welcome')) {
            this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
          }
        }
      }
    });
  }

  changeTheme(): void {
    this.cssClass =
      this.themes.indexOf(this.cssClass) == 0 ? this.themes[1] : this.themes[0];
    this.themingService.theme.next(this.cssClass);
    localStorage.setItem(constants.LOCALSTORAGE_THEME_KEY, this.cssClass);
  }
}
