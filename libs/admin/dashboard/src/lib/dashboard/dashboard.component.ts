import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  collection,
  doc,
  DocumentSnapshot,
  endAt,
  Firestore,
  getDocs,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  startAfter
} from '@angular/fire/firestore';
import { MatAccordion } from '@angular/material/expansion';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { constants, Member } from '@community/data';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy, OnInit {
  isLoading = true;
  lastQueryMember: DocumentSnapshot<Member> | null = null;
  memberCountUnSub: any = null;
  members: Member[] | null = null;
  membersPerPage = constants.DEFAULT_PAGE_SIZE;
  noOfMembers = 0;
  currentPage = 0;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  constructor(private firestore: Firestore, private snackBar: MatSnackBar) {}

  async ngOnInit(): Promise<void> {
    this.memberCountUnSub = onSnapshot(
      doc(this.firestore, 'members', 'counter'),
      {
        next: (snap) => {
          this.noOfMembers = (snap.data() as { count: number }).count ?? 0;
        },
        error: this.handleError
      }
    );
    await this.fetchMembers();
  }

  ngOnDestroy(): void {
    this.memberCountUnSub();
  }

  changePage(event: PageEvent): void {
    if (this.currentPage !== event.pageIndex) {
      const oldIndex = this.currentPage;
      this.currentPage = event.pageIndex;
      this.fetchMembers(event.pageIndex > oldIndex);
    }
  }

  handleError(error: any): void {
    this.snackBar
      .open(error.message, 'REFRESH PAGE')
      .onAction()
      .subscribe(() => window.location.reload());
  }

  async fetchMembers(forward = true): Promise<void> {
    try {
      this.isLoading = true;
      const snap = await getDocs(
        query(
          collection(this.firestore, 'members').withConverter(Member.converter),
          orderBy('authInfo.lastSignInTime', 'desc'),
          ...(forward && this.lastQueryMember
            ? [startAfter(this.lastQueryMember)]
            : []),
          ...(!forward && this.lastQueryMember
            ? [endAt(this.lastQueryMember)]
            : []),
          ...(forward
            ? [limit(this.membersPerPage)]
            : [limitToLast(this.membersPerPage)])
        )
      );
      this.lastQueryMember = snap.docs[snap.docs.length - 1];
      this.members = snap.docs.map((d) => d.data());
      this.isLoading = false;
    } catch (error) {
      this.handleError(error);
    }
  }
}
