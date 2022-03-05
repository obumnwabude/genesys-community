import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public auth: Auth, private router: Router) {}

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/welcome']);
  }
}
