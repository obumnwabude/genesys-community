import { Component, HostBinding, OnInit } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  Auth,
  GoogleAuthProvider,
  signInWithRedirect
} from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

import { constants } from './constants';
import { ThemingService } from './theming.service';
import { SPINNER } from 'ngx-ui-loader';

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
    private snackBar: MatSnackBar,
    public themingService: ThemingService
  ) {}

  ngOnInit(): void {
    this.themingService.theme.subscribe((theme: string) => {
      this.cssClass = theme;
      const oCClasses = this.overlayContainer.getContainerElement().classList;
      oCClasses.remove(...Array.from(this.themes));
      oCClasses.add(this.cssClass);
    });
  }

  changeTheme(): void {
    this.cssClass =
      this.themes.indexOf(this.cssClass) == 0 ? this.themes[1] : this.themes[0];
    this.themingService.theme.next(this.cssClass);
    localStorage.setItem(constants.LOCALSTORAGE_THEME_KEY, this.cssClass);
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