import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { SignInComponent } from './sign-in.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SignInComponent }]),
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  declarations: [SignInComponent]
})
export class SignInModule {}
