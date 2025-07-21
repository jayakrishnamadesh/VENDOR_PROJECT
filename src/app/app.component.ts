import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, LoadingComponent],
  template: `
    <div class="app-container">
      <!-- Loading overlay -->
      <app-loading *ngIf="isLoading"></app-loading>
      
      <!-- Show header and sidebar only when authenticated -->
      <ng-container *ngIf="isAuthenticated && !isLoading">
        <app-header></app-header>
        <div class="main-content">
          <app-sidebar [isCollapsed]="isSidebarCollapsed"></app-sidebar>
          <div class="content-area" [class.sidebar-collapsed]="isSidebarCollapsed">
            <router-outlet></router-outlet>
          </div>
        </div>
      </ng-container>
      
      <!-- Show only router outlet for login -->
      <ng-container *ngIf="!isAuthenticated && !isLoading">
        <router-outlet></router-outlet>
      </ng-container>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      position: relative;
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
      transition: margin-left 0.3s ease;
    }
    
    .content-area.sidebar-collapsed {
      margin-left: 60px;
    }
    
    @media (max-width: 768px) {
      .content-area {
        margin-left: 0;
        padding: 10px;
      }
      
      .content-area.sidebar-collapsed {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  isLoading = true;
  isSidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize authentication check
    this.checkAuthStatus();

    // Listen to authentication changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.isLoading = false;
    });

    // Handle navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.isAuthenticated && !this.router.url.includes('/login')) {
          this.router.navigate(['/login']);
        }
      });

    // Listen for sidebar toggle events
    this.authService.sidebarCollapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });
  }

  private checkAuthStatus() {
    // Check if user is already authenticated
    const token = this.authService.getToken();
    if (token) {
      // Verify token with backend
      this.authService.verifyToken().subscribe({
        next: (response) => {
          if (response.success) {
            this.isAuthenticated = true;
          } else {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      if (!this.router.url.includes('/login')) {
        this.router.navigate(['/login']);
      }
    }
  }
}