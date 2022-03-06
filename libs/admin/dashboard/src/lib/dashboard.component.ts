import { Component, OnInit, ViewChild } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthMember } from '@community/data';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  members: AuthMember[] = [];
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  constructor(private fns: Functions, private snackBar: MatSnackBar) {}

  async ngOnInit(): Promise<void> {
    try {
      this.members = (await httpsCallable(this.fns, 'getAuthMembers')({}))
        .data as AuthMember[];
      this.isLoading = false;
    } catch (error: any) {
      this.snackBar
        .open(error.message, 'REFRESH PAGE')
        .onAction()
        .subscribe(() => window.location.reload());
    }
  }
}
