import { Component, OnInit } from '@angular/core';
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
        <div class="header-left">
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <i class="fas fa-bars"></i>
          </button>
          <div class="logo">
            <i class="fas fa-industry"></i>
            <span class="logo-text">SAP Vendor Portal</span>
          </div>
        </div>
        
        <div class="header-right">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentVendor?.username || 'Vendor' }}</span>
              <span class="user-id">{{ currentVendor?.vendorId || 'V001001' }}</span>
            </div>
          </div>
          
          <div class="header-actions">
            <button class="action-btn" title="Notifications">
              <i class="fas fa-bell"></i>
              <span class="notification-badge">3</span>
            </button>
            
            <div class="dropdown">
              <button class="action-btn dropdown-toggle" (click)="toggleDropdown()">
                <i class="fas fa-cog"></i>
              </button>
              <div class="dropdown-menu" [class.show]="showDropdown">
                <a href="#" class="dropdown-item">
                  <i class="fas fa-user"></i> Profile
                </a>
                <a href="#" class="dropdown-item">
                  <i class="fas fa-cog"></i> Settings
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item" (click)="logout($event)">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </a>
              </div>
            </div>
          </div>
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
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .sidebar-toggle {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }
    
    .sidebar-toggle:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-size: 20px;
      font-weight: bold;
    }
    
    .logo-text {
      font-size: 18px;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }
    
    .user-avatar {
      font-size: 32px;
      opacity: 0.9;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 14px;
    }
    
    .user-id {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .action-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      font-size: 16px;
    }
    
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }
    
    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ff4757;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }
    
    .dropdown {
      position: relative;
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1001;
    }
    
    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      color: #333;
      text-decoration: none;
      transition: background-color 0.2s ease;
      font-size: 14px;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    
    .dropdown-item:first-child {
      border-radius: 8px 8px 0 0;
    }
    
    .dropdown-item:last-child {
      border-radius: 0 0 8px 8px;
    }
    
    .dropdown-divider {
      height: 1px;
      background: #e9ecef;
      margin: 8px 0;
    }
    
    @media (max-width: 768px) {
      .header-content {
        padding: 0 15px;
      }
      
      .logo-text {
        display: none;
      }
      
      .user-details {
        display: none;
      }
      
      .user-info {
        gap: 8px;
      }
      
      .header-actions {
        gap: 8px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentVendor: any;
  showDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentVendor$.subscribe(vendor => {
      this.currentVendor = vendor;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown')) {
        this.showDropdown = false;
      }
    });
  }

  toggleSidebar() {
    this.authService.toggleSidebar();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout(event: Event) {
    event.preventDefault();
    this.showDropdown = false;
    
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}