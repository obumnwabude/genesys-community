import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Member } from '@community/data';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  members: Member[] | null = null;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  constructor(private firestore: Firestore, private snackBar: MatSnackBar) {}

  async ngOnInit(): Promise<void> {
    try {
      const snap = await getDocs(
        collection(this.firestore, 'members').withConverter(Member.converter)
      );
      this.members = snap.docs
        .filter((d) => d.id !== 'counter')
        .map((d) => d.data());
      this.isLoading = false;
    } catch (error: any) {
      console.log(error);
      this.snackBar
        .open(error.message, 'REFRESH PAGE')
        .onAction()
        .subscribe(() => window.location.reload());
    }
  }
}
