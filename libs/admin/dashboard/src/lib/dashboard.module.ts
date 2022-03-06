import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  provideFunctions,
  getFunctions,
  connectFunctionsEmulator
} from '@angular/fire/functions';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material/snack-bar';
import { environment } from '@community/env/environment';

import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    provideFunctions(() => {
      const functions = getFunctions();
      if (!environment.production) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    })
  ],
  declarations: [DashboardComponent],
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
export class DashboardModule {}
