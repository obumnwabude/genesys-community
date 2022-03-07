import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  provideFirestore,
  getFirestore,
  connectFirestoreEmulator
} from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { environment } from '@community/env/environment';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MemberComponent } from './member/member.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent },
      { path: 'member/:id', component: MemberComponent }
    ]),
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule ,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    provideFirestore(() => {
      const firestore = getFirestore();
      if (!environment.production) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    })
  ],
  declarations: [DashboardComponent, MemberComponent],
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
