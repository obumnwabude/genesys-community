import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Member, memberSnap } from '@community/data';

@Component({
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
  isLoading = false;
  hasScrolled = false;
  member: Member | null = null;
  @HostListener('window:scroll') scrolled() {
    this.hasScrolled = this.scroll.getScrollPosition()[1] > 256;
  }

  constructor(
    private firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private scroll: ViewportScroller,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    if (window.history.state.member) {
      this.member = window.history.state.member;
    } else {
      const memberId = this.route.snapshot.paramMap.get('id');
      if (!memberId) this.router.navigateByUrl('/dashboard');
      else {
        try {
          const snap = await memberSnap(this.firestore, memberId);
          if (!snap.exists()) {
            this.snackBar.open(`Member with uid: ${memberId} does not exist.`);
            this.router.navigateByUrl('/dashboard');
          } else {
            this.member = snap.data();
          }
          this.isLoading = false;
        } catch (error: any) {
          if (error.code === 'unavailable') {
            this.snackBar
              .open(
                'Network Error. Please check internet connection.',
                'REFRESH PAGE'
              )
              .onAction()
              .subscribe(() => window.location.reload());
          } else {
            this.snackBar.open(error.message);
            this.router.navigateByUrl('/dashboard');
          }
        }
      }
    }
  }

  capitalise(str: string): string {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  scrollToTop(): void {
    this.scroll.scrollToPosition([0, 0]);
  }
}
