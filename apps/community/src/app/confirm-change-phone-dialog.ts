import { Component } from '@angular/core';

@Component({
  styles: [
    '[subheading] {text-decoration: underline double;}',
    'mat-dialog-actions {justify-content: end; margin: 4px 0 -12px 0;}'
  ],
  template: `<h2 mat-dialog-title subheading>Change Phone?</h2>
    <mat-dialog-content
      >You will have to sign in again and verify your phone number with SMS
      code. Do you want to proceed?</mat-dialog-content
    >
    <mat-dialog-actions>
      <button mat-raised-button [mat-dialog-close]="true" color="primary">
        Yes, Proceed.
      </button>
      <button mat-stroked-button mat-dialog-close color="primary">
        No, Cancel.
      </button>
    </mat-dialog-actions> `
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class ConfirmChangePhoneDialog {}
