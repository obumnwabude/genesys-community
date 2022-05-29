import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { constants } from '@community/data';

@Injectable({
  providedIn: 'root'
})
export class ThemingService {
  theme = new BehaviorSubject(
    localStorage.getItem(constants.LOCALSTORAGE_THEME_KEY) ??
      constants.DEFAULT_THEME
  );

  constructor(@Inject(PLATFORM_ID) platformId: any) {
    if (!localStorage.getItem(constants.LOCALSTORAGE_SYSTEM_MODE_KEY)) {
      localStorage.setItem(constants.LOCALSTORAGE_SYSTEM_MODE_KEY, 'true');
    }

    isPlatformBrowser(platformId) &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches &&
      localStorage.getItem(constants.LOCALSTORAGE_SYSTEM_MODE_KEY) === 'true' &&
      !localStorage.getItem(constants.LOCALSTORAGE_THEME_KEY) &&
      this.theme.next(constants.DARK_MODE);

    isPlatformBrowser(platformId) &&
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          localStorage.getItem(constants.LOCALSTORAGE_SYSTEM_MODE_KEY) ===
            'true' &&
            this.theme.next(
              e.matches ? constants.DARK_MODE : constants.LIGHT_MODE
            );
        });
  }
}
