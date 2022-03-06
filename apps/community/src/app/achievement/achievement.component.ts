import { Component, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { arrayUnion, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AchievementData } from '@community/data';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent {
  achievementData = new AchievementData('', '', '', new Date(), 'blog');
  @ViewChild('achievementForm') achievementForm!: NgForm;

  constructor(
    public auth: Auth,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  async shareAchievement(): Promise<void> {
    if (this.auth.currentUser) {
      if (this.achievementForm.valid) {
        try {
          this.ngxLoader.start();
          this.achievementData.time = new Date();
          await setDoc(
            doc(this.firestore, 'members', this.auth.currentUser.uid),
            {
              achievements: arrayUnion(
                AchievementData.toJSON(this.achievementData)
              )
            },
            { merge: true }
          );
          this.snackBar.open('Your achievement has been shared.');
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
