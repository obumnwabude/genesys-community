import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild
} from '@angular/core';
import {
  Auth,
  ConfirmationResult,
  linkWithPhoneNumber,
  RecaptchaVerifier
} from '@angular/fire/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

declare var grecaptcha: any;

@Component({
  selector: 'app-verify-phone',
  templateUrl: './verify-phone.component.html',
  styleUrls: ['./verify-phone.component.scss']
})
export class VerifyPhoneComponent implements AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: MatInput;
  @ViewChild('codeInput') codeInput!: MatInput;

  recaptchaSolved = false;
  recaptchaExpired = false;
  phoneSubmitted = false;
  secondsLeft = 29;
  countdownInterval!: number;
  confirmationResult: ConfirmationResult | null = null;
  recaptchaVerifier!: RecaptchaVerifier;

  phoneCtrl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^[789][01]\d{8}$/)
  ]);
  phoneForm = new FormGroup({ phone: this.phoneCtrl });

  verifyCodeCtrl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{6}$/)
  ]);
  verifyCodeForm = new FormGroup({ code: this.verifyCodeCtrl });

  constructor(
    private auth: Auth,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.recaptchaVerifier = new RecaptchaVerifier(
      'recaptcha',
      {
        size: 'normal',
        callback: () => {
          this.recaptchaSolved = true;
          this.recaptchaExpired = false;
        },
        'expired-callback': () => (this.recaptchaExpired = true)
      },
      this.auth
    );
    this.recaptchaVerifier.render();
  }

  async submitPhone(): Promise<void> {
    if (!this.recaptchaSolved) {
      this.snackBar.open('Please solve the recaptcha.');
      return;
    }

    if (this.recaptchaExpired) {
      this.snackBar.open('Recaptcha expired, please resolve.');
      return;
    }

    if (this.phoneCtrl.hasError('required')) {
      this.snackBar.open('Phone Number is required.');
      return;
    }

    if (this.phoneCtrl.hasError('pattern')) {
      this.snackBar.open('Please enter a valid phone number.');
      return;
    }

    if (this.auth.currentUser) {
      try {
        this.confirmationResult = await linkWithPhoneNumber(
          this.auth.currentUser,
          `+234${this.phoneCtrl.value}`,
          this.recaptchaVerifier
        );

        this.phoneSubmitted = true;
        this.snackBar.open(
          `We've sent a 6-digit code to +234${this.phoneCtrl.value}`
        );
        this.countdownInterval = window.setInterval(() => {
          this.secondsLeft--;
          if (this.secondsLeft === 0) {
            clearInterval(this.countdownInterval);
          }
        }, 1000);
        this.changeDetector.detectChanges();
        this.verifyCodeForm.reset();
        this.codeInput.focus();
      } catch (error) {
        this.recaptchaVerifier
          .render()
          .then((widgetId) => grecaptcha.reset(widgetId));
        this.snackBar.open(`Code not sent: ${error}`);
      }
    } else {
      this.snackBar.open('You should not be here. Sign In with Google First');
    }
  }

  async submitCode(): Promise<void> {
    if (this.verifyCodeCtrl.hasError('required')) {
      this.snackBar.open('Six digits code is required.');
      return;
    }

    if (this.verifyCodeCtrl.hasError('pattern')) {
      this.snackBar.open('Please enter the six digits sent to you.');
      return;
    }

    if (this.confirmationResult) {
      try {
        await this.confirmationResult.confirm(this.verifyCodeCtrl.value);
      } catch (error: any) {
        this.verifyCodeCtrl.setValue('');
        if (
          error.code === 'auth/credential-already-in-use' ||
          error.code === 'auth/account-exists-with-different-credential'
        ) {
          this.snackBar.open(
            `+234${this.phoneCtrl.value} has been verified by another member`
          );
          this.restartVerification(true);
        } else {
          this.snackBar.open('Wrong code, please try again');
          this.codeInput.focus();
        }
      }
    } else {
      this.snackBar.open(
        'You should not be here. Submit your phone number first.'
      );
    }
  }

  restartVerification(clearPhone: boolean): void {
    this.recaptchaSolved = false;
    this.confirmationResult = null;
    this.secondsLeft = 29;
    clearInterval(this.countdownInterval);
    this.verifyCodeCtrl.setValue('');
    if (clearPhone) this.phoneCtrl.setValue('');
    this.phoneSubmitted = false;
    this.changeDetector.detectChanges();
    this.recaptchaVerifier
      .render()
      .then((widgetId) => grecaptcha.reset(widgetId));
    this.phoneForm.reset();
    this.phoneInput.focus();
  }
}
