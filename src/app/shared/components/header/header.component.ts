import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <i class="fas fa-industry"></i>
          SAP Vendor Portal
        </div>
        <div class="header-actions">
          <span class="welcome-text">Welcome, {{ currentVendor?.username }}</span>
          <button class="btn btn-logout" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      padding: 0 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .logo {
      font-size: 20px;
      font-weight: bold;
      color: white;
    }
    
    .logo i {
      margin-right: 10px;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .welcome-text {
      color: white;
      font-size: 14px;
    }
    
    .btn-logout {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-logout:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
    
    @media (max-width: 768px) {
      .header-content {
        padding: 0 10px;
      }
      
      .logo {
        font-size: 16px;
      }
      
      .welcome-text {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  currentVendor: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentVendor$.subscribe(vendor => {
      this.currentVendor = vendor;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}