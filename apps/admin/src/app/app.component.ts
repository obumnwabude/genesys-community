import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { NavigationEnd, Router } from '@angular/router';
import { constants } from '@community/data';
import { SPINNER } from 'ngx-ui-loader';

import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { filter } from 'rxjs';
import { ThemingService } from './theming.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLargeScreen = false;
  SPINNER = SPINNER;
  SYSTEM_THEME_MODE = constants.SYSTEM_THEME_MODE;
  // the 500 level of orange palette in Material design
  primaryColor = '#ff9800';
  themes = constants.THEMES;
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
    private router: Router,
    public themingService: ThemingService
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
      oCClasses.remove(...Array.from(this.themes));
      oCClasses.add(this.cssClass);
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
    this.router.navigate(['/sign-in']);
  }
}
