import { Component, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { arrayUnion, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProgressData } from '@community/data';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent {
  progressData = new ProgressData('', '', new Date());
  @ViewChild('progressForm') progressForm!: NgForm;
  constructor(
    public auth: Auth,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async recordProgress(): Promise<void> {
    if (this.auth.currentUser) {
      if (this.progressForm.valid) {
        try {
          this.ngxLoader.start();
          this.progressData.time = new Date();
          await setDoc(
            doc(this.firestore, 'members', this.auth.currentUser.uid),
            { progress: arrayUnion(ProgressData.toJSON(this.progressData)) },
            { merge: true }
          );
          this.snackBar.open('Your progress has been recorded');
          this.router.navigate(['/']);
        } catch (error: any) {
          this.snackBar.open(error.message);
        } finally {
          this.ngxLoader.stop();
        }
      } else {
        this.snackBar.open('Please resolve all errors first.');
      }
    } else {
      this.snackBar.open('Please Sign In first.');
      this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
    }
  }
}
