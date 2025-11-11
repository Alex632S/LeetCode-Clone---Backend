import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Делаем AppComponent standalone
  imports: [
    CommonModule,
    RouterModule, // ✅ Добавляем RouterModule для router-outlet
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'LeetCode CMS';

  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
