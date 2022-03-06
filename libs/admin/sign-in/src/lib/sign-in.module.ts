import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { environment } from '@community/env/environment';

import { SignInComponent } from './sign-in.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SignInComponent }]),
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    provideAuth(() => {
      const auth = getAuth();
      if (!environment.production) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    })
  ],
  declarations: [SignInComponent],
  providers: [
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        verticalPosition: 'top'
      }
    }
  ]
})
export class SignInModule {}
