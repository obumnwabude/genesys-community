import { ViewportScroller } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
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
  OrderByDirection,
  query,
  startAfter
} from '@angular/fire/firestore';
import { MatAccordion } from '@angular/material/expansion';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { constants, Counter, Member } from '@community/data';
import { Unsubscribe } from '@firebase/util';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy, OnInit {
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  currentPage = 0;
  extraLabel!: string;
  isLoading = true;
  hasScrolled = false;
  lastQueryMember: DocumentSnapshot<Member> | null = null;
  memberCountUnSub!: Unsubscribe;
  members: Member[] | null = null;
  membersPerPage = constants.DEFAULT_PAGE_SIZE;
  noOfMembers = 0;
  orderBy!: string;
  orderByOptions = constants.ORDER_BY_OPTIONS;
  orderDirection!: OrderByDirection;
  orderDirectionOptions = constants.ORDER_DIRECTION_OPTIONS;
  @HostListener('window:scroll') scrolled() {
    this.hasScrolled = this.scroll.getScrollPosition()[1] > 256;
  }

  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private scroll: ViewportScroller
  ) {}

  async ngOnInit(): Promise<void> {
    this.memberCountUnSub = onSnapshot(
      doc(this.firestore, 'members', 'counter'),
      {
        next: (s) => (this.noOfMembers = (s.data() as Counter).count ?? 0),
        error: (e) => this.handleError(e)
      }
    );
    this.orderBy =
      localStorage.getItem(constants.LOCALSTORAGE_ORDER_BY_KEY) ??
      constants.DEFAULT_ORDER_BY;
    this.orderDirection = (localStorage.getItem(
      constants.LOCALSTORAGE_ORDER_DIRECTION_KEY
    ) ?? constants.DEFAULT_ORDER_DIRECTION) as OrderByDirection;
    this.assignExtraLabel();
    await this.fetchMembers();
  }

  ngOnDestroy(): void {
    this.memberCountUnSub();
  }

  assignExtraLabel(): void {
    const order = this.orderBy.split('authInfo.')[1];
    if (!['email', 'displayName', 'phoneNumber'].includes(order)) {
      this.extraLabel = this.orderByOptions.filter(
        (o) => o.value === this.orderBy
      )[0].viewValue;
    } else this.extraLabel = '';
  }

  changeOrderBy(): void {
    localStorage.setItem(constants.LOCALSTORAGE_ORDER_BY_KEY, this.orderBy);
    this.currentPage = 0;
    this.assignExtraLabel();
    this.lastQueryMember = null;
    this.fetchMembers();
  }

  changeOrderDirection(): void {
    localStorage.setItem(
      constants.LOCALSTORAGE_ORDER_DIRECTION_KEY,
      this.orderDirection
    );
    if (this.members) this.members = this.members.reverse();
  }

  changePage(event: PageEvent): void {
    if (this.currentPage !== event.pageIndex) {
      const oldIndex = this.currentPage;
      this.currentPage = event.pageIndex;
      this.fetchMembers(event.pageIndex > oldIndex);
    }
  }

  extraValue(member: Member): string {
    const order = this.orderBy.split('authInfo.')[1];
    if (!['email', 'displayName', 'phoneNumber'].includes(order)) {
      const [firstKey, secondKey] = this.orderBy.split('.');
      return !['creationTime', 'lastSignInTime'].includes(secondKey)
        ? (Member.converter.toFirestore(member) as any)[firstKey][secondKey]
        : secondKey === 'creationTime'
        ? member.authInfo.creationTime
        : member.authInfo.lastSignInTime;
    } else return '';
  }

  async fetchMembers(forward = true): Promise<void> {
    try {
      this.isLoading = true;
      const snap = await getDocs(
        query(
          collection(this.firestore, 'members').withConverter(Member.converter),
          orderBy(this.orderBy, this.orderDirection),
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
      this.members = null;
    }
  }

  handleError(error: any): void {
    this.snackBar
      .open(error.message, 'REFRESH PAGE')
      .onAction()
      .subscribe(() => window.location.reload());
  }

  scrollToTop(): void {
    this.scroll.scrollToPosition([0, 0]);
  }
}
