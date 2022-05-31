import { Component } from '@angular/core';
import { Auth, unlink, updateProfile } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes
} from '@angular/fire/storage';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { firstValueFrom } from 'rxjs';
import { ConfirmChangePhoneDialog } from '../confirm-change-phone-dialog';
import { ConfirmRemovePhotoDialog } from '../confirm-remove-photo-dialog';

@Component({
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  isEditingName = false;
  isUploadingPhoto = false;

  name = new FormControl(
    {
      value: this.auth.currentUser?.displayName,
      disabled: !this.isEditingName
    },
    Validators.required
  );

  constructor(
    public auth: Auth,
    private dialog: MatDialog,
    private firestore: Firestore,
    private ngxLoader: NgxUiLoaderService,
    private router: Router,
    private snackBar: MatSnackBar,
    private storage: Storage
  ) {
    this.auth.onAuthStateChanged((member) => {
      if (member) this.name.setValue(member.displayName);
    });
  }

  tappedPicker(): boolean {
    if (this.isUploadingPhoto) {
      this.snackBar.open('Photo is uploading, please wait...');
      return false;
    } else return true;
  }

  async pickedImage(event: any) {
    event.preventDefault();
    if (event.target.files.length === 0) return;
    const file = event.target.files[0];
    if (!file.type.match('image.*')) {
      this.snackBar.open('Please select only images');
    } else if (file.size > 200000) {
      this.snackBar.open('Maximum of 200kb please');
    } else if (this.auth.currentUser) {
      this.isUploadingPhoto = true;
      const oldPhotoURLParts = this.auth.currentUser.photoURL
        ?.split('?')[0]
        .split('.');
      let oldExt = '';
      if (oldPhotoURLParts) {
        oldExt = oldPhotoURLParts[oldPhotoURLParts.length - 1];
      }
      const fileNameParts = file.name.split('.');
      const ext = fileNameParts[fileNameParts.length - 1];
      const photoRef = ref(
        this.storage,
        `/profilePhotos/${'this.auth.currentUser.uid'}.${ext}`
      );
      try {
        await uploadBytes(photoRef, file);
        await updateProfile(this.auth.currentUser, {
          photoURL: await getDownloadURL(photoRef)
        });
        if (oldExt && oldExt != ext) {
          await deleteObject(
            ref(
              this.storage,
              `/profilePhotos/${this.auth.currentUser.uid}.${oldExt}`
            )
          );
        }
        await this.auth.currentUser.reload();
      } catch (error: any) {
        this.snackBar.open(error.message);
      } finally {
        this.isUploadingPhoto = false;
      }
    } else {
      this.router.navigateByUrl('/sign-in');
    }
  }

  async removePhoto(): Promise<void> {
    if (this.auth.currentUser != null) {
      if (!this.auth.currentUser.photoURL) {
        this.snackBar.open('No photo to remove');
      } else {
        const confirm = await firstValueFrom(
          this.dialog
            .open(ConfirmRemovePhotoDialog, {
              autoFocus: false,
              maxWidth: '384px'
            })
            .afterClosed()
        );
        if (confirm) {
          try {
            this.isUploadingPhoto = true;
            await deleteObject(
              ref(this.storage, this.auth.currentUser.photoURL?.split('?')[0])
            );
            await updateProfile(this.auth.currentUser, { photoURL: '' });
            await setDoc(
              doc(this.firestore, `/members/${this.auth.currentUser.uid}`),
              { authInfo: { photoURL: '' } },
              { merge: true }
            );
            this.snackBar.open('Profile Photo successfully removed');
          } catch (error: any) {
            this.snackBar.open(error.message);
          } finally {
            this.isUploadingPhoto = false;
          }
        }
      }
    } else {
      this.router.navigateByUrl('/welcome');
    }
  }

  async updateName(): Promise<void> {
    if (this.name.invalid) {
      this.snackBar.open('First fill out your name or cancel.');
    } else if (this.auth.currentUser != null) {
      try {
        this.ngxLoader.start();
        await updateProfile(this.auth.currentUser, {
          displayName: this.name.value
        });
        await setDoc(
          doc(this.firestore, `/members/${this.auth.currentUser.uid}`),
          { authInfo: { displayName: this.name.value } },
          { merge: true }
        );
        this.snackBar.open('Name successfully updated');
        this.isEditingName = false;
        this.name.disable();
      } catch (error: any) {
        this.snackBar.open(error.message);
      } finally {
        this.ngxLoader.stop();
      }
    } else {
      this.router.navigateByUrl('/welcome');
    }
  }

  async updatePhone(): Promise<void> {
    if (this.auth.currentUser != null) {
      if (!this.auth.currentUser.phoneNumber) {
        this.snackBar.open('There is no phone number in your account.');
      } else {
        const confirm = await firstValueFrom(
          this.dialog
            .open(ConfirmChangePhoneDialog, {
              autoFocus: false,
              maxWidth: '384px'
            })
            .afterClosed()
        );
        if (confirm) {
          try {
            this.ngxLoader.start();
            await unlink(this.auth.currentUser, 'phone');
            await setDoc(
              doc(this.firestore, `/members/${this.auth.currentUser.uid}`),
              { authInfo: { phoneNumber: '' } },
              { merge: true }
            );
            await this.auth.signOut();
            // didn't navigate here because onAuthStateChanged in AppComponent
            // will navigate
            // this.router.navigateByUrl(`/welcome?next=${this.router.url}`);
          } catch (error: any) {
            this.snackBar.open(error.message);
          } finally {
            this.ngxLoader.stop();
          }
        }
      }
    } else {
      this.router.navigateByUrl('/welcome');
    }
  }
}
