import { BreakpointObserver } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { constants, memberSnap } from '@community/data';
import { SPINNER } from 'ngx-ui-loader';
import { filter } from 'rxjs/operators';

import { ThemingService } from './theming.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  SPINNER = SPINNER;
  SYSTEM_THEME_MODE = constants.SYSTEM_THEME_MODE;
  isLargeScreen = false;
  isMember = false;
  navLinks = [
    { link: '/', name: 'Home' },
    { link: '/progress', name: 'Record Progress' },
    { link: '/achievement', name: 'Share Achievement' },
    { link: '/account', name: 'Account Settings' }
  ];
  // the 500 level of orange palette in Material design
  primaryColor = '#ff9800';
  year = new Date().getFullYear();
  @HostBinding('class') public cssClass!: string;
  @ViewChild('snav') snav!: MatSidenav;

  get isInSystemThemeMode(): boolean {
    return localStorage.getItem(constants.LS_SYSTEM_MODE_KEY) === 'true';
  }

  get themeModes(): string[] {
    return [...constants.THEMES, constants.SYSTEM_THEME_MODE];
  }

  constructor(
    public auth: Auth,
    private breakpoint: BreakpointObserver,
    private overlayContainer: OverlayContainer,
    private firestore: Firestore,
    public themingService: ThemingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.breakpoint
      .observe('(min-width: 768px)')
      .subscribe((b) => (this.isLargeScreen = b.matches));

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => !this.isLargeScreen && this.snav.close());

    this.themingService.theme.subscribe((theme: string) => {
      this.cssClass = theme;
      const oCClasses = this.overlayContainer.getContainerElement().classList;
      oCClasses.remove(...Array.from(constants.THEMES));
      oCClasses.add(this.cssClass);
    });

    this.auth.onAuthStateChanged(async (authMember) => {
      if (!authMember) {
        this.isMember = false;
        if (!this.router.url.includes('welcome')) {
          this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
        }
      } else {
        try {
          const snap = await memberSnap(this.firestore, authMember.uid);
          let hasSetProfile = false;
          if (snap.exists()) {
            const firestoreMember = snap.data();
            const phoneInAuth = authMember.phoneNumber;
            const phoneInFirestore = firestoreMember.authInfo.phoneNumber;
            if (!phoneInFirestore || phoneInFirestore !== phoneInAuth) {
              await setDoc(
                doc(this.firestore, 'members', authMember.uid),
                { authInfo: { phoneNumber: phoneInAuth } },
                { merge: true }
              );
            }
            const { department, gender, faculty, level, twitter } =
              firestoreMember.profile;
            hasSetProfile = !(
              [department, gender, faculty, level, twitter].filter(
                (i) => i === ''
              ).length === 5
            );
          }

          this.isMember = hasSetProfile;
          if (
            (!this.isMember || !authMember.phoneNumber) &&
            !this.router.url.includes('welcome')
          ) {
            this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
          }
        } catch (_) {
          if (!this.router.url.includes('welcome')) {
            this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
          }
        }
      }
    });
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  changeTheme(mode: string): void {
    if (mode === constants.SYSTEM_THEME_MODE) {
      localStorage.setItem(constants.LS_SYSTEM_MODE_KEY, 'true');
      localStorage.removeItem(constants.LS_THEME_KEY);
      this.themingService.theme.next(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? constants.DARK_MODE
          : constants.LIGHT_MODE
      );
    } else {
      localStorage.setItem(constants.LS_SYSTEM_MODE_KEY, 'false');
      localStorage.setItem(constants.LS_THEME_KEY, mode);
      this.themingService.theme.next(mode);
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/welcome']);
  }
}
