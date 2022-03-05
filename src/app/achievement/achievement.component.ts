import { Component, ViewChild } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

class AchievementData {
  constructor(
    public description: string,
    public link: string,
    public title: string,
    public type: string
  ) {}

  toJSON() {
    const { description, link, title, type } = this;
    return { description, link, title, type };
  }
}

@Component({
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent {
  achievementData = new AchievementData('', '', '', 'blog');
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
          const achievement = {
            time: new Date(),
            ...this.achievementData.toJSON()
          };
          await setDoc(
            doc(this.firestore, 'members', this.auth.currentUser.uid),
            { achievements: [achievement] },
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
      this.snackBar.open('You should not be here. Sign In first.');
    }
  }
}
