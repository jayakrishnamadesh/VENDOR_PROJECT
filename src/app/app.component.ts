import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <!-- Show header and sidebar only when authenticated -->
      <ng-container *ngIf="isAuthenticated">
        <app-header></app-header>
        <div class="main-content">
          <app-sidebar></app-sidebar>
          <div class="content-area">
            <router-outlet></router-outlet>
          </div>
        </div>
      </ng-container>
      
      <!-- Show only router outlet for login -->
      <ng-container *ngIf="!isAuthenticated">
        <router-outlet></router-outlet>
      </ng-container>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }
    
    .main-content {
      display: flex;
      padding-top: 60px;
    }
    
    .content-area {
      flex: 1;
      margin-left: 250px;
      padding: 20px;
      background-color: #f8f9fa;
      min-height: calc(100vh - 60px);
    }
    
    @media (max-width: 768px) {
      .content-area {
        margin-left: 0;
        padding: 10px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check authentication status
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // Navigate to login if not authenticated
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.isAuthenticated && !this.router.url.includes('/login')) {
          this.router.navigate(['/login']);
        }
      });
  }
}